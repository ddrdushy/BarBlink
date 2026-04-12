import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaitlistService {
  constructor(private prisma: PrismaService) {}

  async addEmail(email: string, source = 'landing_page') {
    return this.prisma.waitlistEntry.upsert({
      where: { email },
      create: { email, source },
      update: {}, // ignore duplicate
    });
  }

  async listEntries(page = 1, limit = 20, search?: string) {
    const where = search
      ? { email: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.waitlistEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.waitlistEntry.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, addedToday, addedThisWeek] = await Promise.all([
      this.prisma.waitlistEntry.count(),
      this.prisma.waitlistEntry.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.waitlistEntry.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);

    return { total, addedToday, addedThisWeek };
  }

  async exportCsv() {
    return this.prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
