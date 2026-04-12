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
        type: p.type,
        drinkName: p.drinkName,
        drinkRating: p.drinkRating,
        originalPostId: p.originalPostId,
        pollOptions: p.pollOptions,
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
        type: dto.type || 'photo',
        drinkName: dto.drinkName,
        drinkRating: dto.drinkRating,
        pollOptions: dto.pollOptions ? dto.pollOptions : undefined,
      },
    });
    this.publishEvent('post.created', { postId: result.id, userId, type: result.type });
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
      type: post.type,
      drinkName: post.drinkName,
      drinkRating: post.drinkRating,
      originalPostId: post.originalPostId,
      pollOptions: post.pollOptions,
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
    this.publishEvent('post.liked', { postId, likedByUserId: userId, authorId: post.userId });
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

    const comment = await this.prisma.comment.create({
      data: { postId, userId, body: dto.body },
    });
    this.publishEvent('comment.created', { postId, commentId: comment.id, commenterId: userId, authorId: post.userId });
    return comment;
  }

  // --- Poll voting ---

  async votePoll(userId: string, postId: string, optionIdx: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.type !== 'poll') throw new ForbiddenException('Post is not a poll');

    const options = post.pollOptions as string[];
    if (optionIdx < 0 || optionIdx >= options.length) {
      throw new ForbiddenException('Invalid option index');
    }

    await this.prisma.pollVote.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId, optionIdx },
      update: { optionIdx },
    });
    return { message: 'Vote recorded' };
  }

  async getPollResults(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.type !== 'poll') throw new ForbiddenException('Post is not a poll');

    const options = post.pollOptions as string[];
    const votes = await this.prisma.pollVote.groupBy({
      by: ['optionIdx'],
      where: { postId },
      _count: { id: true },
    });

    const votesMap = new Map(votes.map((v) => [v.optionIdx, v._count.id]));
    const totalVotes = votes.reduce((sum, v) => sum + v._count.id, 0);

    return {
      postId,
      options: options.map((label, idx) => ({
        idx,
        label,
        votes: votesMap.get(idx) || 0,
      })),
      totalVotes,
    };
  }

  // --- Repost ---

  async repost(userId: string, originalPostId: string, caption?: string) {
    const original = await this.prisma.post.findUnique({ where: { id: originalPostId } });
    if (!original || !original.isActive) throw new NotFoundException('Original post not found');

    const result = await this.prisma.post.create({
      data: {
        userId,
        type: 'repost',
        originalPostId,
        caption: caption || null,
      },
    });
    this.publishEvent('post.reposted', { postId: result.id, originalPostId, userId });
    return result;
  }

  // --- Bookmarks ---

  async bookmarkPost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.bookmark.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId },
      update: {},
    });
    return { message: 'Bookmarked' };
  }

  async unbookmarkPost(userId: string, postId: string) {
    await this.prisma.bookmark.deleteMany({
      where: { userId, postId },
    });
    return { message: 'Unbookmarked' };
  }

  async getBookmarks(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.bookmark.count({ where: { userId } }),
    ]);

    // Fetch the actual posts for these bookmarks
    const postIds = items.map((b) => b.postId);
    const posts = await this.prisma.post.findMany({
      where: { id: { in: postIds }, isActive: true },
      include: {
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId }, select: { id: true } },
      },
    });

    const postMap = new Map(posts.map((p) => [p.id, p]));

    return {
      items: items
        .map((b) => {
          const p = postMap.get(b.postId);
          if (!p) return null;
          return {
            bookmarkId: b.id,
            bookmarkedAt: b.createdAt.toISOString(),
            post: {
              id: p.id,
              userId: p.userId,
              venueId: p.venueId,
              caption: p.caption,
              type: p.type,
              mediaUrls: p.mediaUrls,
              createdAt: p.createdAt.toISOString(),
              likeCount: p._count.likes,
              commentCount: p._count.comments,
              isLikedByMe: p.likes.length > 0,
            },
          };
        })
        .filter(Boolean),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
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

  // --- Reports ---

  async submitReport(reporterId: string, contentType: string, contentId: string, reason: string) {
    const report = await this.prisma.report.create({
      data: { reporterId, contentType, contentId, reason },
    });
    this.publishEvent('report.submitted', { reportId: report.id, reporterId, contentType, contentId, reason });
    return report;
  }

  async getReports(status?: string, page = 1, limit = 20) {
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);
    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async actionReport(reportId: string, actionTaken: string, actionedBy: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'actioned', actionTaken, actionedBy },
    });
    this.publishEvent('report.actioned', { reportId, actionTaken, actionedBy });
    return updated;
  }

  // --- Night Recap ---

  async generateNightRecap(userId: string) {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // 1. Fetch tonight's check-ins for this user from checkin-service
    let checkins: { venueName?: string }[] = [];
    try {
      const res = await fetch(
        `${this.checkinServiceUrl}/checkins/tonight?userId=${userId}`,
      );
      if (res.ok) {
        const body = await res.json();
        checkins = body.data ?? body ?? [];
      }
    } catch {
      // checkin-service may be unavailable
    }

    // 2. Fetch posts created tonight by this user
    const tonightPosts = await this.prisma.post.findMany({
      where: {
        userId,
        isActive: true,
        createdAt: { gte: twelveHoursAgo },
      },
      include: {
        _count: { select: { likes: true } },
      },
    });

    // If user had no activity tonight, skip recap
    if (checkins.length === 0 && tonightPosts.length === 0) {
      return null;
    }

    // 3. Compile recap caption
    const venueNames = checkins
      .map((c) => c.venueName)
      .filter(Boolean);
    const totalLikes = tonightPosts.reduce((sum, p) => sum + p._count.likes, 0);

    const parts: string[] = ['Your night:'];
    if (venueNames.length > 0) {
      parts.push(`checked into ${venueNames.join(' and ')}.`);
    }
    if (tonightPosts.length > 0) {
      parts.push(`${tonightPosts.length} post${tonightPosts.length > 1 ? 's' : ''}, ${totalLikes} like${totalLikes !== 1 ? 's' : ''} received.`);
    }
    const caption = parts.join(' ');

    // 4. Create the recap post
    const recap = await this.prisma.post.create({
      data: {
        userId,
        type: 'night_recap',
        caption,
      },
    });
    this.publishEvent('post.created', { postId: recap.id, userId, type: 'night_recap' });
    return recap;
  }

  async generateNightRecapForAll() {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // Find all users who had check-ins tonight (via posts as a proxy)
    // In a real implementation this would query checkin-service for all tonight's check-in user IDs
    const recentPosts = await this.prisma.post.findMany({
      where: { isActive: true, createdAt: { gte: twelveHoursAgo } },
      select: { userId: true },
      distinct: ['userId'],
    });

    // Also try to get tonight's check-in user IDs from checkin-service
    let checkinUserIds: string[] = [];
    try {
      const res = await fetch(`${this.checkinServiceUrl}/checkins/tonight`);
      if (res.ok) {
        const body = await res.json();
        const checkins = body.data ?? body ?? [];
        checkinUserIds = [...new Set(checkins.map((c: { userId?: string }) => c.userId).filter(Boolean))] as string[];
      }
    } catch {
      // degrade gracefully
    }

    // Merge unique user IDs
    const allUserIds = [...new Set([
      ...recentPosts.map((p) => p.userId),
      ...checkinUserIds,
    ])];

    const results: { userId: string; recapId: string | null }[] = [];
    for (const userId of allUserIds) {
      try {
        const recap = await this.generateNightRecap(userId);
        results.push({ userId, recapId: recap?.id ?? null });
      } catch {
        results.push({ userId, recapId: null });
      }
    }

    return { generated: results.filter((r) => r.recapId).length, total: allUserIds.length, results };
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
