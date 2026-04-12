import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VendorUpdateVenueDto } from './dto/vendor-update-venue.dto';
import { ListVenuesQueryDto } from './dto/list-venues-query.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller()
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  // Public endpoints
  @Get('venues')
  list(@Query() query: ListVenuesQueryDto) {
    return this.venuesService.list(query);
  }

  // Venue Follow — static routes before :id wildcard
  @UseGuards(JwtAuthGuard)
  @Get('venues/me/following')
  getFollowedVenues(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.venuesService.getFollowedVenues(userId);
  }

  @Get('venues/:id')
  getById(@Param('id') id: string) {
    return this.venuesService.getById(id);
  }

  @Get('venues/:id/photos')
  getPhotos(@Param('id') id: string) {
    return this.venuesService.getPhotos(id);
  }

  @Get('venues/:id/followers/count')
  getVenueFollowerCount(@Param('id') id: string) {
    return this.venuesService.getVenueFollowerCount(id);
  }

  @Get('venues/:id/reviews')
  getReviews(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.venuesService.getReviews(id, page ? +page : 1, limit ? +limit : 20);
  }

  @UseGuards(JwtAuthGuard)
  @Post('venues/:id/reviews')
  addReview(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { overallRating: number; body?: string },
  ) {
    const { userId } = req.user as { userId: string };
    return this.venuesService.addReview(userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('venues/:id/follow')
  followVenue(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.venuesService.followVenue(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('venues/:id/follow')
  unfollowVenue(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.venuesService.unfollowVenue(userId, id);
  }

  // Vendor Portal endpoints (JWT protected — will be VendorGuard later)
  @UseGuards(JwtAuthGuard)
  @Get('vendor/venue')
  getVendorVenue(@Req() req: Request) {
    const { venueId } = req.user as { venueId: string };
    return this.venuesService.getVendorVenue(venueId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('vendor/venue')
  updateVendorVenue(@Req() req: Request, @Body() dto: VendorUpdateVenueDto) {
    const { venueId } = req.user as { venueId: string };
    return this.venuesService.updateVendorVenue(venueId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/venue/reviews')
  getVendorVenueReviews(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const { venueId } = req.user as { venueId: string };
    return this.venuesService.getVendorVenueReviews(venueId, page ? +page : 1, limit ? +limit : 20);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor/venue/stats')
  getVendorVenueStats(@Req() req: Request) {
    const { venueId } = req.user as { venueId: string };
    return this.venuesService.getVendorVenueStats(venueId);
  }

  // Admin endpoints (JWT protected)
  @UseGuards(JwtAuthGuard)
  @Post('admin/venues')
  create(@Body() dto: CreateVenueDto) {
    return this.venuesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/venues/:id')
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto) {
    return this.venuesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  stats() {
    return this.venuesService.adminStats();
  }
}
