import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('registrations')
  getDailyRegistrations(@Query('days') days?: string) {
    return this.analyticsService.getDailyRegistrations(
      days ? parseInt(days) : 30,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('activity')
  getDailyActivity(@Query('days') days?: string) {
    return this.analyticsService.getDailyActivity(
      days ? parseInt(days) : 30,
    );
  }
}
