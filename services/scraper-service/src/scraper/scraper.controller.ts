import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScrapeVenueDto } from './dto/scrape-venue.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // Trigger a scrape for a venue (admin only)
  @UseGuards(JwtAuthGuard)
  @Post('admin/scraper/scrape')
  scrape(@Body() dto: ScrapeVenueDto) {
    return this.scraperService.scrapeVenue(dto);
  }

  // Get scrape job history
  @UseGuards(JwtAuthGuard)
  @Get('admin/scraper/jobs')
  getJobs(@Query('venueId') venueId?: string) {
    return this.scraperService.getJobHistory(venueId);
  }

  // Get scraped data for a venue
  @UseGuards(JwtAuthGuard)
  @Get('admin/scraper/data/:venueId')
  getData(@Param('venueId') venueId: string) {
    return this.scraperService.getScrapedData(venueId);
  }

  // Scraper health stats
  @UseGuards(JwtAuthGuard)
  @Get('admin/scraper/stats')
  stats() {
    return this.scraperService.adminStats();
  }
}
