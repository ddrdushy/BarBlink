import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckinDto } from './dto/checkin.dto';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class CheckinsService {
  constructor(private prisma: PrismaService) {}

  async checkin(userId: string, dto: CreateCheckinDto) {
    // Auto-checkout any existing active check-in
    await this.prisma.checkin.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, checkedOutAt: new Date() },
    });

    // Expire stale check-ins for this venue (> 6 hours)
    await this.expireStale();

    const result = await this.prisma.checkin.create({
      data: {
        userId,
        venueId: dto.venueId,
        lat: dto.lat,
        lng: dto.lng,
      },
    });
    this.publishEvent('user.checked_in', { userId, venueId: dto.venueId, checkinId: result.id });
    return result;
  }

  async checkout(userId: string, checkinId: string) {
    const checkin = await this.prisma.checkin.findFirst({
      where: { id: checkinId, userId, isActive: true },
    });
    if (!checkin) {
      throw new NotFoundException('Active check-in not found');
    }

    return this.prisma.checkin.update({
      where: { id: checkinId },
      data: { isActive: false, checkedOutAt: new Date() },
    });
  }

  async getActive(userId: string) {
    await this.expireStale();

    return this.prisma.checkin.findFirst({
      where: { userId, isActive: true },
    });
  }

  async getVenueCrowdCount(venueId: string) {
    await this.expireStale();

    const count = await this.prisma.checkin.count({
      where: { venueId, isActive: true },
    });

    return { venueId, count };
  }

  async getTonight() {
    await this.expireStale();

    // All active check-ins from today — friend filtering comes in Phase 7
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.checkin.findMany({
      where: {
        isActive: true,
        checkedInAt: { gte: today },
      },
      orderBy: { checkedInAt: 'desc' },
      take: 50,
    });
  }

  // --- Admin endpoints ---

  async adminListCheckins(query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const [items, total] = await Promise.all([
      this.prisma.checkin.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { checkedInAt: 'desc' },
      }),
      this.prisma.checkin.count(),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async adminStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalToday, totalActive] = await Promise.all([
      this.prisma.checkin.count({ where: { checkedInAt: { gte: today } } }),
      this.prisma.checkin.count({ where: { isActive: true } }),
    ]);
    return { checkinsToday: totalToday, activeNow: totalActive };
  }

  private async expireStale() {
    const cutoff = new Date(Date.now() - SIX_HOURS_MS);
    await this.prisma.checkin.updateMany({
      where: { isActive: true, checkedInAt: { lt: cutoff } },
      data: { isActive: false, checkedOutAt: cutoff },
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
