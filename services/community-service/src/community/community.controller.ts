import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { AddVenueDto } from './dto/add-venue.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @Get('streaks/me')
  getMyStreak(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.communityService.getMyStreak(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('badges/me')
  getMyBadges(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.communityService.getMyBadges(userId);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.communityService.getLeaderboard();
  }

  @UseGuards(JwtAuthGuard)
  @Get('collections/me')
  getMyCollections(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.communityService.getMyCollections(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('collections')
  createCollection(@Req() req: Request, @Body() dto: CreateCollectionDto) {
    const { userId } = req.user as { userId: string };
    return this.communityService.createCollection(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('collections/:id/venues')
  addVenue(
    @Req() req: Request,
    @Param('id') collectionId: string,
    @Body() dto: AddVenueDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.communityService.addVenueToCollection(userId, collectionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('collections/:id/venues/:venueId')
  removeVenue(
    @Req() req: Request,
    @Param('id') collectionId: string,
    @Param('venueId') venueId: string,
  ) {
    const { userId } = req.user as { userId: string };
    return this.communityService.removeVenueFromCollection(userId, collectionId, venueId);
  }
}

@Controller('admin')
export class AdminCommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @Get('community/stats')
  stats() {
    return this.communityService.adminStats();
  }
}
