import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  async createAd(dto: CreateAdDto) {
    return this.prisma.ad.create({
      data: {
        venueId: dto.venueId,
        title: dto.title,
        body: dto.body,
        imageUrl: dto.imageUrl,
        targetUrl: dto.targetUrl,
        targetArea: dto.targetArea,
        targetCountry: dto.targetCountry,
        budget: dto.budget,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async listAds(
    status?: string,
    venueId?: string,
    page = 1,
    limit = 20,
  ) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (venueId) where.venueId = venueId;

    const [items, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.ad.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdForFeed(area?: string, country?: string) {
    const now = new Date();
    const where: Record<string, unknown> = {
      status: 'active',
    };

    // Only show ads within their date range
    if (area) where.targetArea = area;
    if (country) where.targetCountry = country;

    // Find an active ad that hasn't exceeded its budget
    const ads = await this.prisma.ad.findMany({
      where: {
        ...where,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      take: 10,
      orderBy: { impressions: 'asc' }, // favor under-served ads
    });

    if (ads.length === 0) return null;

    // Pick a random ad from the candidates for variety
    const ad = ads[Math.floor(Math.random() * ads.length)];

    // Check budget constraint
    if (ad.budget && Number(ad.spent) >= Number(ad.budget)) {
      return null;
    }

    return ad;
  }

  async recordImpression(adId: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');

    await this.prisma.ad.update({
      where: { id: adId },
      data: { impressions: { increment: 1 } },
    });

    return { message: 'Impression recorded' };
  }

  async recordClick(adId: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');

    await this.prisma.ad.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });

    return { message: 'Click recorded' };
  }

  async updateAd(adId: string, dto: UpdateAdDto) {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');

    const data: Record<string, unknown> = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.budget !== undefined) data.budget = dto.budget;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.body !== undefined) data.body = dto.body;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.targetUrl !== undefined) data.targetUrl = dto.targetUrl;
    if (dto.targetArea !== undefined) data.targetArea = dto.targetArea;
    if (dto.targetCountry !== undefined) data.targetCountry = dto.targetCountry;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);

    return this.prisma.ad.update({
      where: { id: adId },
      data,
    });
  }

  async getAdStats(adId: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');

    const ctr = ad.impressions > 0
      ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
      : '0.00';

    return {
      id: ad.id,
      title: ad.title,
      status: ad.status,
      impressions: ad.impressions,
      clicks: ad.clicks,
      ctr: `${ctr}%`,
      budget: ad.budget,
      spent: ad.spent,
    };
  }
}
