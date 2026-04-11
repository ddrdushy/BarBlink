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

    return this.prisma.checkin.create({
      data: {
        userId,
        venueId: dto.venueId,
        lat: dto.lat,
        lng: dto.lng,
      },
    });
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

  private async expireStale() {
    const cutoff = new Date(Date.now() - SIX_HOURS_MS);
    await this.prisma.checkin.updateMany({
      where: { isActive: true, checkedInAt: { lt: cutoff } },
      data: { isActive: false, checkedOutAt: cutoff },
    });
  }
}
