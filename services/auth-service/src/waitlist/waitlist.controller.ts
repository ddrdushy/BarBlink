import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('waitlist')
export class WaitlistPublicController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  addEmail(@Body() body: { email: string; source?: string }) {
    return this.waitlistService.addEmail(body.email, body.source);
  }
}

@Controller('admin/waitlist')
export class WaitlistAdminController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.waitlistService.listEntries(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats() {
    return this.waitlistService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  exportCsv() {
    return this.waitlistService.exportCsv();
  }
}
