import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private pushService?: PushService,
  ) {}

  async listNotifications(userId: string, query: { page: number; limit: number }) {
    const { page, limit } = query;

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Not your notification');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { message: `Marked ${result.count} notifications as read` };
  }

  async createNotification(dto: CreateNotificationDto) {
    const notif = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body || null,
        metadata: (dto.metadata || undefined) as any,
      },
    });

    // Send push notification if push service is available
    if (this.pushService) {
      const tokens = await this.prisma.deviceToken.findMany({
        where: { userId: dto.userId },
        select: { token: true },
      });
      if (tokens.length > 0) {
        await this.pushService.sendToMultiple(
          tokens.map((t) => t.token),
          dto.title,
          dto.body || '',
          { type: dto.type, notificationId: notif.id },
        );
      }
    }

    return notif;
  }

  async registerDevice(userId: string, token: string, platform: string) {
    return this.prisma.deviceToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    });
  }

  async removeDevice(token: string) {
    await this.prisma.deviceToken.deleteMany({ where: { token } });
    return { message: 'Device removed' };
  }

  // --- Notification Preferences ---

  async getPreferences(userId: string) {
    let prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      // Create default preferences on first access
      prefs = await this.prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return prefs;
  }

  async updatePreferences(
    userId: string,
    dto: {
      pushEnabled?: boolean;
      emailEnabled?: boolean;
      likesEnabled?: boolean;
      commentsEnabled?: boolean;
      followsEnabled?: boolean;
      checkinsEnabled?: boolean;
      eventsEnabled?: boolean;
    },
  ) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  // --- Admin endpoints ---

  async adminStats() {
    const totalUnread = await this.prisma.notification.count({
      where: { read: false },
    });
    return { totalUnread };
  }
}
