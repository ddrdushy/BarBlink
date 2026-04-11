import {
  Controller, Get, Post, Put,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  list(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { userId } = req.user as { userId: string };
    return this.notificationsService.listNotifications(userId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  markAsRead(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.notificationsService.markAsRead(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('read-all')
  markAllAsRead(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.notificationsService.markAllAsRead(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createNotification(dto);
  }
}

@Controller('admin')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('notifications/stats')
  stats() {
    return this.notificationsService.adminStats();
  }
}
