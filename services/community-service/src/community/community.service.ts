import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { AddVenueDto } from './dto/add-venue.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async getMyStreak(userId: string) {
    let streak = await this.prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await this.prisma.userStreak.create({
        data: { userId },
      });
    }

    return streak;
  }

  async getMyBadges(userId: string) {
    return this.prisma.badge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async getLeaderboard() {
    const leaders = await this.prisma.userStreak.findMany({
      where: { currentStreak: { gt: 0 } },
      orderBy: { currentStreak: 'desc' },
      take: 20,
    });

    return leaders.map((s, index) => ({
      rank: index + 1,
      userId: s.userId,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
    }));
  }

  async getMyCollections(userId: string) {
    return this.prisma.venueCollection.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCollection(userId: string, dto: CreateCollectionDto) {
    return this.prisma.venueCollection.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description || null,
      },
    });
  }

  async addVenueToCollection(userId: string, collectionId: string, dto: AddVenueDto) {
    const collection = await this.prisma.venueCollection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    if (collection.userId !== userId) {
      throw new ForbiddenException('Not your collection');
    }

    const existing = await this.prisma.venueCollectionItem.findUnique({
      where: { collectionId_venueId: { collectionId, venueId: dto.venueId } },
    });
    if (existing) {
      throw new ConflictException('Venue already in collection');
    }

    return this.prisma.venueCollectionItem.create({
      data: {
        collectionId,
        venueId: dto.venueId,
      },
    });
  }

  async removeVenueFromCollection(userId: string, collectionId: string, venueId: string) {
    const collection = await this.prisma.venueCollection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    if (collection.userId !== userId) {
      throw new ForbiddenException('Not your collection');
    }

    const item = await this.prisma.venueCollectionItem.findUnique({
      where: { collectionId_venueId: { collectionId, venueId } },
    });
    if (!item) {
      throw new NotFoundException('Venue not in collection');
    }

    await this.prisma.venueCollectionItem.delete({
      where: { id: item.id },
    });
    return { message: 'Venue removed from collection' };
  }

  // --- Admin endpoints ---

  async adminStats() {
    const [activeStreaks, badgesAwarded] = await Promise.all([
      this.prisma.userStreak.count({ where: { currentStreak: { gt: 0 } } }),
      this.prisma.badge.count(),
    ]);
    return { activeStreaks, badgesAwarded };
  }
}
