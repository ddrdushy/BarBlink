import {
  Controller, Get, Post, Put,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { PromotersService } from './promoters.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin/promoters')
export class PromotersController {
  constructor(private readonly promotersService: PromotersService) {}

  @Post()
  create(
    @Body() body: {
      userId: string;
      displayName: string;
      instagramUrl?: string;
      tiktokUrl?: string;
      followerCount?: number;
      bio?: string;
    },
  ) {
    return this.promotersService.createPromoter(body);
  }

  @Get()
  list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.promotersService.listPromoters(
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: {
      displayName?: string;
      instagramUrl?: string;
      tiktokUrl?: string;
      followerCount?: number;
      bio?: string;
      isVerified?: boolean;
      status?: string;
    },
  ) {
    return this.promotersService.updatePromoter(id, body);
  }
}
