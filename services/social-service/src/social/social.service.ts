import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.post.create({
      data: {
        userId,
        venueId: dto.venueId,
        caption: dto.caption,
      },
    });
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
}
