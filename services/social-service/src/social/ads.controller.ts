import {
  Controller, Get, Post, Put,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/ads')
export class AdminAdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post()
  create(@Body() dto: CreateAdDto) {
    return this.adsService.createAd(dto);
  }

  @Get()
  list(
    @Query('status') status?: string,
    @Query('venueId') venueId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adsService.listAds(
      status || undefined,
      venueId || undefined,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    return this.adsService.updateAd(id, dto);
  }

  @Get(':id/stats')
  stats(@Param('id') id: string) {
    return this.adsService.getAdStats(id);
  }
}

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('feed')
  getAdForFeed(
    @Query('area') area?: string,
    @Query('country') country?: string,
  ) {
    return this.adsService.getAdForFeed(area, country);
  }

  @Post(':id/impression')
  recordImpression(@Param('id') id: string) {
    return this.adsService.recordImpression(id);
  }

  @Post(':id/click')
  recordClick(@Param('id') id: string) {
    return this.adsService.recordClick(id);
  }
}
