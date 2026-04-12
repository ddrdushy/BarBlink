import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromotersService {
  private readonly logger = new Logger(PromotersService.name);

  constructor(private prisma: PrismaService) {}

  async createPromoter(data: {
    userId: string;
    displayName: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    followerCount?: number;
    bio?: string;
  }) {
    const promoter = await this.prisma.promoterAccount.create({
      data: {
        userId: data.userId,
        displayName: data.displayName,
        instagramUrl: data.instagramUrl,
        tiktokUrl: data.tiktokUrl,
        followerCount: data.followerCount,
        bio: data.bio,
      },
    });

    this.logger.log(`Promoter created: ${promoter.displayName} (user: ${data.userId})`);
    return promoter;
  }

  async listPromoters(status?: string, page = 1, limit = 20) {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.promoterAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promoterAccount.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updatePromoter(id: string, data: {
    displayName?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    followerCount?: number;
    bio?: string;
    isVerified?: boolean;
    status?: string;
  }) {
    const promoter = await this.prisma.promoterAccount.findUnique({ where: { id } });
    if (!promoter) throw new NotFoundException('Promoter not found');

    const updateData: Record<string, unknown> = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.instagramUrl !== undefined) updateData.instagramUrl = data.instagramUrl;
    if (data.tiktokUrl !== undefined) updateData.tiktokUrl = data.tiktokUrl;
    if (data.followerCount !== undefined) updateData.followerCount = data.followerCount;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await this.prisma.promoterAccount.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Promoter updated: ${updated.displayName} (${id})`);
    return updated;
  }
}
