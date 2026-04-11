import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { ListVenuesQueryDto } from './dto/list-venues-query.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  // Public endpoints
  @Get('venues')
  list(@Query() query: ListVenuesQueryDto) {
    return this.venuesService.list(query);
  }

  @Get('venues/:id')
  getById(@Param('id') id: string) {
    return this.venuesService.getById(id);
  }

  @Get('venues/:id/photos')
  getPhotos(@Param('id') id: string) {
    return this.venuesService.getPhotos(id);
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
