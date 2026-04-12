import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDailyRegistrations(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    // Get all users created since the start date
    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const buckets = new Map<string, number>();

    // Pre-fill all days with 0
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      buckets.set(key, 0);
    }

    // Count registrations per day
    for (const user of users) {
      const key = user.createdAt.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    return Array.from(buckets.entries()).map(([date, count]) => ({
      date,
      registrations: count,
    }));
  }

  async getDailyActivity(days = 30) {
    // For now, return registration data as a proxy for activity
    // This will be expanded with cross-service data in later phases
    return this.getDailyRegistrations(days);
  }
}
