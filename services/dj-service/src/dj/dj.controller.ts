import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DjService } from './dj.service';
import { CreateDjDto } from './dto/create-dj.dto';
import { UpdateDjDto } from './dto/update-dj.dto';
import { ListDjQueryDto } from './dto/list-dj-query.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class DjController {
  constructor(private readonly djService: DjService) {}

  // Public endpoints
  @Get('dj')
  list(@Query() query: ListDjQueryDto) {
    return this.djService.list(query);
  }

  @Get('dj/:id')
  getById(@Param('id') id: string) {
    return this.djService.getById(id);
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
