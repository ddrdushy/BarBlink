import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Public endpoints
  @Get('events')
  list(@Query() query: ListEventsQueryDto) {
    return this.eventsService.list(query);
  }

  @Get('events/:id')
  getById(@Param('id') id: string) {
    return this.eventsService.getById(id);
  }

  // User endpoints (JWT protected)
  @UseGuards(JwtAuthGuard)
  @Post('events/:id/rsvp')
  rsvp(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { userId: string };
    return this.eventsService.rsvp(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('events/:id/rsvp')
  cancelRsvp(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { userId: string };
    return this.eventsService.cancelRsvp(id, user.userId);
  }

  // Admin endpoints (JWT protected)
  @UseGuards(JwtAuthGuard)
  @Post('admin/events')
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/events/:id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/events/stats')
  stats() {
    return this.eventsService.adminStats();
  }
}
