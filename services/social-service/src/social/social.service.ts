import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StoriesService } from './stories.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

interface FeedItem {
  type: 'hero_post' | 'post' | 'checkin_pair';
  data: Record<string, unknown>;
}

@Injectable()
export class SocialService {
  private readonly checkinServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private storiesService: StoriesService,
  ) {
    this.checkinServiceUrl = this.configService.get<string>(
      'CHECKIN_SERVICE_URL',
      'http://localhost:3006/v1',
    );
  }

  async getFeed(userId: string, query: FeedQueryDto) {
    const { page = 1, limit = 20 } = query;

    const posts = await this.prisma.post.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId }, select: { id: true } },
      },
    });

    const total = await this.prisma.post.count({ where: { isActive: true } });

    return {
      items: posts.map((p) => ({
        id: p.id,
        userId: p.userId,
        venueId: p.venueId,
        caption: p.caption,
        mediaUrls: p.mediaUrls,
        createdAt: p.createdAt.toISOString(),
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        isLikedByMe: p.likes.length > 0,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const result = await this.prisma.post.create({
      data: {
        userId,
        venueId: dto.venueId,
        caption: dto.caption,
      },
    });
    this.publishEvent('post.created', { postId: result.id, userId });
    return result;
  }

  async getPost(postId: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: { select: { likes: true, comments: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });
    if (!post || !post.isActive) throw new NotFoundException('Post not found');

    return {
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLikedByMe: userId ? (post.likes as { id: string }[]).length > 0 : false,
      _count: undefined,
      likes: undefined,
    };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not your post');

    await this.prisma.post.update({
      where: { id: postId },
      data: { isActive: false },
    });
    return { message: 'Post deleted' };
  }

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.like.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId },
      update: {},
    });
    return { message: 'Liked' };
  }

  async unlikePost(userId: string, postId: string) {
    await this.prisma.like.deleteMany({
      where: { userId, postId },
    });
    return { message: 'Unliked' };
  }

  async getComments(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.comment.create({
      data: { postId, userId, body: dto.body },
    });
  }

  // --- Admin endpoints ---

  async adminListPosts(query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { likes: true, comments: true } } },
      }),
      this.prisma.post.count(),
    ]);
    return {
      items: items.map((p) => ({
        ...p,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        _count: undefined,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async adminDeletePost(postId: string) {
    await this.prisma.post.update({
      where: { id: postId },
      data: { isActive: false },
    });
    return { message: 'Post deleted by admin' };
  }

  async adminStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalPosts, postsToday] = await Promise.all([
      this.prisma.post.count({ where: { isActive: true } }),
      this.prisma.post.count({ where: { isActive: true, createdAt: { gte: today } } }),
    ]);
    return { totalPosts, postsToday };
  }

  // --- Check-in reactions ---

  async reactToCheckin(userId: string, checkinId: string, emoji: string) {
    await this.prisma.checkinReaction.upsert({
      where: { userId_checkinId: { userId, checkinId } },
      create: { userId, checkinId, emoji },
      update: { emoji },
    });
    return { message: 'Reacted' };
  }

  async getCheckinReactions(checkinId: string) {
    return this.prisma.checkinReaction.findMany({
      where: { checkinId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // --- Enriched feed ---

  async getEnrichedFeed(userId: string, page = 1, limit = 20) {
    // Fetch posts
    const feedResult = await this.getFeed(userId, { page, limit });

    // Fetch active stories
    const stories = await this.storiesService.getActiveStories(userId);

    // Fetch tonight's check-ins from checkin-service
    let tonightCheckins: Record<string, unknown>[] = [];
    try {
      const res = await fetch(`${this.checkinServiceUrl}/checkins/tonight`);
      if (res.ok) {
        const body = await res.json();
        tonightCheckins = body.data ?? body ?? [];
      }
    } catch {
      // checkin-service may be unavailable - degrade gracefully
    }

    // Build interleaved items list
    const items: FeedItem[] = [];
    const posts = feedResult.items;
    let checkinIdx = 0;

    for (let i = 0; i < posts.length; i++) {
      // First post is the hero
      if (i === 0) {
        items.push({ type: 'hero_post', data: posts[i] });
      } else {
        items.push({ type: 'post', data: posts[i] });
      }

      // After each post (except hero), try to insert a check-in pair
      if (i > 0 && checkinIdx + 1 < tonightCheckins.length) {
        items.push({
          type: 'checkin_pair',
          data: {
            checkins: [
              tonightCheckins[checkinIdx],
              tonightCheckins[checkinIdx + 1],
            ],
          },
        });
        checkinIdx += 2;
      }
    }

    // Build tonight strip from remaining check-ins
    const tonightStrip = tonightCheckins.map((c) => c);

    return {
      stories,
      tonightStrip,
      items,
    };
  }

  private async publishEvent(topic: string, payload: Record<string, unknown>) {
    try {
      const { Kafka } = require('kafkajs');
      const kafka = new Kafka({ brokers: [process.env.REDPANDA_BROKERS || 'localhost:9092'] });
      const producer = kafka.producer();
      await producer.connect();
      await producer.send({ topic, messages: [{ value: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }) }] });
      await producer.disconnect();
    } catch { /* silent - event publishing is non-critical */ }
  }
}
