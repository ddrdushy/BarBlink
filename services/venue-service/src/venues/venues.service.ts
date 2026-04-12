import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '../prisma/generated';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { ListVenuesQueryDto } from './dto/list-venues-query.dto';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListVenuesQueryDto) {
    const { country, area, category, page = 1, limit = 20 } = query;
    const where: Prisma.VenueWhereInput = { status: 'active' };
    if (country) where.country = country;
    if (area) where.area = area;
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      this.prisma.venue.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.venue.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: { photos: { orderBy: { displayOrder: 'asc' } }, hours: true },
    });
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async getPhotos(venueId: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Venue not found');
    return this.prisma.venuePhoto.findMany({
      where: { venueId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async create(dto: CreateVenueDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const venue = await this.prisma.venue.create({
      data: { ...dto, slug },
    });
    this.publishEvent('venue.created', { venueId: venue.id });
    return venue;
  }

  async update(id: string, dto: UpdateVenueDto) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');
    return this.prisma.venue.update({ where: { id }, data: dto });
  }

  async adminStats() {
    const total = await this.prisma.venue.count({ where: { status: 'active' } });
    return { totalVenues: total };
  }

  // --- Venue Follow ---

  async followVenue(userId: string, venueId: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Venue not found');
    const existing = await this.prisma.venueFollow.findUnique({
      where: { userId_venueId: { userId, venueId } },
    });
    if (existing) return existing;
    return this.prisma.venueFollow.create({
      data: { userId, venueId },
    });
  }

  async unfollowVenue(userId: string, venueId: string) {
    await this.prisma.venueFollow.deleteMany({
      where: { userId, venueId },
    });
    return { message: 'Unfollowed venue' };
  }

  async getFollowedVenues(userId: string) {
    const follows = await this.prisma.venueFollow.findMany({
      where: { userId },
      select: { venueId: true },
    });
    const venueIds = follows.map((f) => f.venueId);
    if (venueIds.length === 0) return [];
    return this.prisma.venue.findMany({
      where: { id: { in: venueIds } },
    });
  }

  async getVenueFollowerCount(venueId: string) {
    const count = await this.prisma.venueFollow.count({ where: { venueId } });
    return { venueId, followerCount: count };
  }

  // --- Venue Reviews ---

  async getReviews(venueId: string, page = 1, limit = 20) {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Venue not found');

    const [items, total] = await Promise.all([
      this.prisma.venueReview.findMany({
        where: { venueId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.venueReview.count({ where: { venueId } }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async addReview(userId: string, venueId: string, data: { overallRating: number; body?: string }) {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Venue not found');

    if (data.overallRating < 1 || data.overallRating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return this.prisma.venueReview.create({
      data: {
        venueId,
        userId,
        overallRating: data.overallRating,
        body: data.body ?? null,
      },
    });
  }

  async getAverageRating(venueId: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Venue not found');

    const result = await this.prisma.venueReview.aggregate({
      where: { venueId },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    return {
      venueId,
      averageRating: result._avg.overallRating ?? null,
      reviewCount: result._count.id,
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
