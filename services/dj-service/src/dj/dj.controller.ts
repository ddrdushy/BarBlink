import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { DjService } from './dj.service';
import { CreateDjDto } from './dto/create-dj.dto';
import { UpdateDjDto } from './dto/update-dj.dto';
import { ListDjQueryDto } from './dto/list-dj-query.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller()
export class DjController {
  constructor(private readonly djService: DjService) {}

  // Public endpoints
  @Get('dj/trending')
  getTrending(@Query('type') type?: string, @Query('genre') genre?: string) {
    return this.djService.getTrending(type, genre);
  }

  @Get('dj')
  list(@Query() query: ListDjQueryDto) {
    return this.djService.list(query);
  }

  @Get('dj/:id')
  getById(@Param('id') id: string) {
    return this.djService.getById(id);
  }

  @Get('dj/:id/ratings')
  getRatings(@Param('id') id: string) {
    return this.djService.getRatings(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('dj/:id/rate')
  rateDj(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    const { userId } = req.user as { userId: string };
    return this.djService.rateDj(userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('dj/:id/setlist')
  postSetlist(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { eventId?: string; songs: string[]; notes?: string },
  ) {
    const { userId } = req.user as { userId: string };
    return this.djService.postSetlist(userId, id, body);
  }

  @Get('dj/:id/setlists')
  getSetlists(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.djService.getSetlists(id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  // --- Gig management ---

  @UseGuards(JwtAuthGuard)
  @Post('admin/dj/:id/gig')
  addGig(@Param('id') id: string, @Body() body: { venueId: string }) {
    return this.djService.addGig(id, body.venueId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/dj/:id/gig/:venueId')
  removeGig(@Param('id') id: string, @Param('venueId') venueId: string) {
    return this.djService.removeGig(id, venueId);
  }

  // Admin endpoints (JWT protected)
  @UseGuards(JwtAuthGuard)
  @Post('admin/dj')
  create(@Body() dto: CreateDjDto) {
    return this.djService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/dj/:id')
  update(@Param('id') id: string, @Body() dto: UpdateDjDto) {
    return this.djService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/dj/stats')
  stats() {
    return this.djService.adminStats();
  }
}
