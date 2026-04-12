import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '../prisma/generated';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDjDto } from './dto/create-dj.dto';
import { UpdateDjDto } from './dto/update-dj.dto';
import { ListDjQueryDto } from './dto/list-dj-query.dto';

@Injectable()
export class DjService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListDjQueryDto) {
    const { country, genre, page = 1, limit = 20 } = query;
    const where: Prisma.DjProfileWhereInput = { status: 'active' };
    if (country) where.country = country;
    if (genre) where.genreTags = { has: genre };

    const [items, total] = await Promise.all([
      this.prisma.djProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.djProfile.count({ where }),
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
    const dj = await this.prisma.djProfile.findUnique({
      where: { id },
      include: { venueLinks: true },
    });
    if (!dj) throw new NotFoundException('DJ not found');
    return dj;
  }

  async create(dto: CreateDjDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const dj = await this.prisma.djProfile.create({
      data: { ...dto, slug } as any,
    });
    this.publishEvent('dj.profile_created', { djId: dj.id, name: dj.name });
    return dj;
  }

  async update(id: string, dto: UpdateDjDto) {
    const dj = await this.prisma.djProfile.findUnique({ where: { id } });
    if (!dj) throw new NotFoundException('DJ not found');
    return this.prisma.djProfile.update({ where: { id }, data: dto as any });
  }

  async addGig(djId: string, venueId: string) {
    const dj = await this.prisma.djProfile.findUnique({ where: { id: djId } });
    if (!dj) throw new NotFoundException('DJ not found');

    try {
      const link = await this.prisma.djVenueLink.create({
        data: { djId, venueId },
      });
      this.publishEvent('dj.gig_added', { djId, venueId, linkId: link.id });
      return link;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('DJ is already linked to this venue');
      }
      throw e;
    }
  }

  async removeGig(djId: string, venueId: string) {
    const dj = await this.prisma.djProfile.findUnique({ where: { id: djId } });
    if (!dj) throw new NotFoundException('DJ not found');

    await this.prisma.djVenueLink.deleteMany({ where: { djId, venueId } });
    return { message: 'Gig removed' };
  }

  async adminStats() {
    const total = await this.prisma.djProfile.count();
    return { totalDjs: total };
  }

  // --- DJ Ratings ---

  async getRatings(djId: string) {
    const dj = await this.prisma.djProfile.findUnique({ where: { id: djId } });
    if (!dj) throw new NotFoundException('DJ not found');

    return this.prisma.djRating.findMany({
      where: { djId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async rateDj(userId: string, djId: string, data: { rating: number; comment?: string }) {
    const dj = await this.prisma.djProfile.findUnique({ where: { id: djId } });
    if (!dj) throw new NotFoundException('DJ not found');

    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return this.prisma.djRating.upsert({
      where: { djId_userId: { djId, userId } },
      create: {
        djId,
        userId,
        rating: data.rating,
        comment: data.comment ?? null,
      },
      update: {
        rating: data.rating,
        comment: data.comment ?? null,
      },
    });
  }

  async getAverageRating(djId: string) {
    const dj = await this.prisma.djProfile.findUnique({ where: { id: djId } });
    if (!dj) throw new NotFoundException('DJ not found');

    const result = await this.prisma.djRating.aggregate({
      where: { djId },
      _avg: { rating: true },
      _count: { id: true },
    });

    return {
      djId,
      averageRating: result._avg.rating ?? null,
      ratingCount: result._count.id,
    };
  }

  // --- Setlists ---

  async postSetlist(
    userId: string,
    djId: string,
    data: { eventId?: string; songs: string[]; notes?: string },
  ) {
    const dj = await this.prisma.djProfile.findUnique({ where: { id: djId } });
    if (!dj) throw new NotFoundException('DJ not found');

    if (!data.songs || data.songs.length === 0) {
      throw new BadRequestException('At least one song is required');
    }
    if (data.songs.length > 50) {
      throw new BadRequestException('Maximum 50 songs per setlist');
    }
    for (const song of data.songs) {
      if (song.length > 100) {
        throw new BadRequestException('Each song name must be 100 characters or less');
      }
    }

    const setlist = await this.prisma.setlist.create({
      data: {
        djId,
        userId,
        eventId: data.eventId ?? null,
        songs: data.songs,
        notes: data.notes ?? null,
      },
    });

    this.publishEvent('dj.setlist_posted', { djId, setlistId: setlist.id });
    return setlist;
  }

  async getSetlists(djId: string, page = 1, limit = 20) {
    const dj = await this.prisma.djProfile.findUnique({ where: { id: djId } });
    if (!dj) throw new NotFoundException('DJ not found');

    const [items, total] = await Promise.all([
      this.prisma.setlist.findMany({
        where: { djId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.setlist.count({ where: { djId } }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // --- Trending (Who's Hot This Week) ---

  async getTrending(type?: string, genre?: string) {
    const where: Prisma.DjProfileWhereInput = { status: 'active' };
    if (type) where.type = type as any;
    if (genre) where.genreTags = { has: genre };

    // Get all matching DJ profiles with their rating counts
    const djs = await this.prisma.djProfile.findMany({
      where,
      include: {
        ratings: { select: { id: true } },
      },
    });

    // Sort by rating count (proxy for popularity) and take top 20
    const ranked = djs
      .map((dj) => ({
        id: dj.id,
        name: dj.name,
        slug: dj.slug,
        type: dj.type,
        avatarUrl: dj.avatarUrl,
        genreTags: dj.genreTags,
        country: dj.country,
        ratingCount: dj.ratings.length,
        rank: 0,
      }))
      .sort((a, b) => b.ratingCount - a.ratingCount)
      .slice(0, 20)
      .map((dj, index) => ({ ...dj, rank: index + 1 }));

    return ranked;
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
