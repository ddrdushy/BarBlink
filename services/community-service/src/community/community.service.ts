import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { AddVenueDto } from './dto/add-venue.dto';

const SEED_NEIGHBOURHOODS = [
  { name: 'Bukit Bintang', area: 'bukit_bintang', country: 'MY' },
  { name: 'KLCC', area: 'klcc', country: 'MY' },
  { name: 'Bangsar', area: 'bangsar', country: 'MY' },
  { name: 'Mont Kiara', area: 'mont_kiara', country: 'MY' },
  { name: 'Sri Hartamas', area: 'sri_hartamas', country: 'MY' },
  { name: 'Desa ParkCity', area: 'desa_parkcity', country: 'MY' },
  { name: 'Kollupitiya', area: 'kollupitiya', country: 'LK' },
  { name: 'Bambalapitiya', area: 'bambalapitiya', country: 'LK' },
  { name: 'Cinnamon Gardens', area: 'cinnamon_gardens', country: 'LK' },
  { name: 'Fort', area: 'fort', country: 'LK' },
  { name: 'Mount Lavinia', area: 'mount_lavinia', country: 'LK' },
];

@Injectable()
export class CommunityService implements OnModuleInit {
  private readonly logger = new Logger(CommunityService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedNeighbourhoods();
  }

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

  // --- Neighbourhood Groups ---

  async getNeighbourhoods(country?: string) {
    const where = country ? { country } : {};
    return this.prisma.neighbourhoodGroup.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getNeighbourhoodFeed(area: string) {
    const group = await this.prisma.neighbourhoodGroup.findUnique({
      where: { area },
    });
    if (!group) {
      throw new NotFoundException('Neighbourhood not found');
    }

    // Full feed requires cross-service calls (checkins, events, etc.)
    // For now return area info with empty items
    return {
      area: group.area,
      name: group.name,
      country: group.country,
      items: [],
    };
  }

  async seedNeighbourhoods() {
    for (const n of SEED_NEIGHBOURHOODS) {
      await this.prisma.neighbourhoodGroup.upsert({
        where: { area: n.area },
        create: n,
        update: {},
      });
    }
    this.logger.log(`Seeded ${SEED_NEIGHBOURHOODS.length} neighbourhood groups`);
  }

  // --- Loyalty & Rewards ---

  async getMyLoyaltyPoints(userId: string) {
    return this.prisma.loyaltyPoints.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async addPoints(userId: string, venueId: string, points: number) {
    const existing = await this.prisma.loyaltyPoints.findUnique({
      where: { userId_venueId: { userId, venueId } },
    });

    if (existing) {
      return this.prisma.loyaltyPoints.update({
        where: { userId_venueId: { userId, venueId } },
        data: { points: existing.points + points },
      });
    }

    return this.prisma.loyaltyPoints.create({
      data: { userId, venueId, points },
    });
  }

  async getVenueRewards(venueId: string) {
    return this.prisma.reward.findMany({
      where: { venueId, isActive: true },
      orderBy: { pointsCost: 'asc' },
    });
  }

  async redeemReward(userId: string, rewardId: string) {
    const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) throw new NotFoundException('Reward not found');
    if (!reward.isActive) throw new ForbiddenException('Reward is no longer available');

    const loyalty = await this.prisma.loyaltyPoints.findUnique({
      where: { userId_venueId: { userId, venueId: reward.venueId } },
    });

    if (!loyalty || loyalty.points < reward.pointsCost) {
      throw new ForbiddenException('Not enough points');
    }

    await this.prisma.loyaltyPoints.update({
      where: { userId_venueId: { userId, venueId: reward.venueId } },
      data: { points: loyalty.points - reward.pointsCost },
    });

    return {
      message: 'Reward redeemed successfully',
      reward: { id: reward.id, name: reward.name },
      remainingPoints: loyalty.points - reward.pointsCost,
    };
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
