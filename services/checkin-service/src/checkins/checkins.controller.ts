import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CreateCheckinDto } from './dto/checkin.dto';
import { CreateGroupCheckinDto } from './dto/group-checkin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  checkin(@Req() req: Request, @Body() dto: CreateCheckinDto) {
    const { userId } = req.user as { userId: string };
    return this.checkinsService.checkin(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  checkout(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.checkinsService.checkout(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('active')
  getActive(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.checkinsService.getActive(userId);
  }

  @Get('venue/:venueId')
  getVenueCrowd(@Param('venueId') venueId: string) {
    return this.checkinsService.getVenueCrowdCount(venueId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tonight')
  getTonight() {
    return this.checkinsService.getTonight();
  }

  @UseGuards(JwtAuthGuard)
  @Post('group')
  createGroupCheckin(@Req() req: Request, @Body() dto: CreateGroupCheckinDto) {
    const { userId } = req.user as { userId: string };
    return this.checkinsService.createGroupCheckin(userId, dto.venueId, dto.name, dto.memberIds);
  }

  @UseGuards(JwtAuthGuard)
  @Post('group/:id/join')
  joinGroupCheckin(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.checkinsService.joinGroupCheckin(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('group/:id')
  getGroupCheckin(@Param('id') id: string) {
    return this.checkinsService.getGroupCheckin(id);
  }
}

@Controller('admin')
export class AdminCheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('checkins')
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.checkinsService.adminListCheckins({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats() {
    return this.checkinsService.adminStats();
  }
}
