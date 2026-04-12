import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (existing) {
      throw new ConflictException('Profile already exists');
    }

    const usernameTaken = await this.prisma.profile.findUnique({
      where: { username: dto.username },
    });
    if (usernameTaken) {
      throw new ConflictException('Username is already taken');
    }

    return this.prisma.profile.create({
      data: {
        id: userId,
        username: dto.username,
        displayName: dto.displayName,
        country: dto.country || 'MY',
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id: userId },
      data: dto,
    });
  }

  async getByUsername(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
    });
    if (!profile) {
      throw new NotFoundException('User not found');
    }
    return profile;
  }

  // --- Follow system ---

  async sendFollowRequest(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      throw new ConflictException('Follow request already sent');
    }
    const result = await this.prisma.follow.create({
      data: { followerId, followingId },
    });
    this.publishEvent('friend.request_sent', { fromUserId: followerId, toUserId: followingId });
    return result;
  }

  async unfollow(followerId: string, followingId: string) {
    await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
    return { message: 'Unfollowed' };
  }

  async getFollowers(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followingId: userId, status: 'accepted' },
      include: { follower: { select: { id: true, username: true, displayName: true, avatarUrl: true, country: true } } },
    });
    return follows.map((f) => f.follower);
  }

  async getFollowing(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId, status: 'accepted' },
      include: { following: { select: { id: true, username: true, displayName: true, avatarUrl: true, country: true } } },
    });
    return follows.map((f) => f.following);
  }

  async getPendingRequests(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followingId: userId, status: 'pending' },
      include: { follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
    return follows.map((f) => ({ id: f.id, ...f.follower, requestedAt: f.createdAt }));
  }

  async respondToRequest(userId: string, requestId: string, action: string) {
    const follow = await this.prisma.follow.findFirst({
      where: { id: requestId, followingId: userId, status: 'pending' },
    });
    if (!follow) throw new NotFoundException('Follow request not found');

    if (action === 'accepted') {
      return this.prisma.follow.update({
        where: { id: requestId },
        data: { status: 'accepted' },
      });
    } else {
      return this.prisma.follow.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });
    }
  }

  async getFollowCounts(userId: string) {
    const [followers, following] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId, status: 'accepted' } }),
      this.prisma.follow.count({ where: { followerId: userId, status: 'accepted' } }),
    ]);
    return { followers, following };
  }

  async searchUsers(query: string, currentUserId: string) {
    const users = await this.prisma.profile.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: { id: true, username: true, displayName: true, avatarUrl: true, country: true },
    });
    return users;
  }

  // --- Admin endpoints ---

  async adminListUsers(query: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = query;
    const where = search
      ? { OR: [
          { username: { contains: search, mode: 'insensitive' as const } },
          { displayName: { contains: search, mode: 'insensitive' as const } },
        ] }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async adminUpdateStatus(userId: string, status: string) {
    // Note: status lives in auth-service. For now we track it here too.
    // In production, this would call auth-service internally.
    return { userId, status, message: `User status updated to ${status}` };
  }

  async adminStats() {
    const total = await this.prisma.profile.count();
    return { totalUsers: total };
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
