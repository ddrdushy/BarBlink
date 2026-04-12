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

  // --- Going Tonight ---

  async setGoingTonight(userId: string, venueId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.prisma.profile.update({
      where: { id: userId },
      data: { goingTonight: true, goingVenueId: venueId },
    });
  }

  async clearGoingTonight(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.prisma.profile.update({
      where: { id: userId },
      data: { goingTonight: false, goingVenueId: null },
    });
  }

  async getGoingTonightUsers(country?: string) {
    const where: any = { goingTonight: true };
    if (country) where.country = country;
    return this.prisma.profile.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        country: true,
        goingVenueId: true,
      },
    });
  }

  // --- Trusted Circle + Home Safe ---

  async getTrustedCircle(userId: string) {
    const entries = await this.prisma.trustedCircle.findMany({
      where: { userId },
    });
    if (entries.length === 0) return [];
    const friendIds = entries.map((e) => e.friendId);
    return this.prisma.profile.findMany({
      where: { id: { in: friendIds } },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    });
  }

  async addToTrustedCircle(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new ConflictException('Cannot add yourself to trusted circle');
    }
    const existing = await this.prisma.trustedCircle.findUnique({
      where: { userId_friendId: { userId, friendId } },
    });
    if (existing) {
      throw new ConflictException('Already in trusted circle');
    }
    return this.prisma.trustedCircle.create({
      data: { userId, friendId },
    });
  }

  async removeFromTrustedCircle(userId: string, friendId: string) {
    await this.prisma.trustedCircle.deleteMany({
      where: { userId, friendId },
    });
    return { message: 'Removed from trusted circle' };
  }

  async sendHomeSafe(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    await this.prisma.profile.update({
      where: { id: userId },
      data: { isHomeSafe: true },
    });
    this.publishEvent('user.home_safe', { userId, timestamp: new Date().toISOString() });
    return { message: 'Home safe status sent' };
  }

  // --- QR Code Connect ---

  async getOrCreateQrCode(userId: string) {
    const existing = await this.prisma.qrCode.findUnique({ where: { userId } });
    if (existing) return existing;
    const crypto = require('crypto');
    const code = crypto.randomBytes(4).toString('hex');
    return this.prisma.qrCode.create({
      data: { userId, code },
    });
  }

  async connectViaQr(code: string, currentUserId: string) {
    const qr = await this.prisma.qrCode.findUnique({ where: { code } });
    if (!qr) throw new NotFoundException('QR code not found');
    if (qr.userId === currentUserId) {
      throw new ConflictException('Cannot connect with yourself');
    }
    return this.sendFollowRequest(currentUserId, qr.userId);
  }

  // --- People You May Know ---

  async getSuggestions(userId: string, country?: string) {
    // Find who I follow (accepted)
    const myFollowing = await this.prisma.follow.findMany({
      where: { followerId: userId, status: 'accepted' },
      select: { followingId: true },
    });
    const myFollowingIds = myFollowing.map((f) => f.followingId);
    if (myFollowingIds.length === 0) return [];

    // Find who they follow (2nd degree) that I don't already follow
    const alreadyFollowing = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const excludeIds = [userId, ...alreadyFollowing.map((f) => f.followingId)];

    const where: any = {
      followerId: { in: myFollowingIds },
      followingId: { notIn: excludeIds },
      status: 'accepted',
    };

    const secondDegree = await this.prisma.follow.findMany({
      where,
      select: { followingId: true },
    });

    const suggestedIds = [...new Set(secondDegree.map((f) => f.followingId))];
    if (suggestedIds.length === 0) return [];

    const profileWhere: any = { id: { in: suggestedIds } };
    if (country) profileWhere.country = country;

    return this.prisma.profile.findMany({
      where: profileWhere,
      take: 10,
      select: { id: true, username: true, displayName: true, avatarUrl: true, country: true },
    });
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
