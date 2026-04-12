import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ScrapeVenueDto } from './dto/scrape-venue.dto';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private venueUrl: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.venueUrl = this.config.get('VENUE_SERVICE_URL', 'http://localhost:3003/v1');
  }

  async scrapeVenue(dto: ScrapeVenueDto) {
    const results: { instagram?: any; google?: any } = {};

    if (dto.source === 'instagram' || dto.source === 'both') {
      results.instagram = await this.scrapeInstagram(dto.venueId, dto.instagramUrl);
    }

    if (dto.source === 'google' || dto.source === 'both') {
      results.google = await this.scrapeGoogle(dto.venueId);
    }

    return results;
  }

  private async scrapeInstagram(venueId: string, instagramUrl?: string) {
    const job = await this.prisma.scrapeJob.create({
      data: { venueId, source: 'instagram', status: 'success' },
    });

    try {
      // In production, this would use Playwright to scrape Instagram
      // For now, we simulate the scrape and log what would happen
      this.logger.log(`[Instagram] Scraping venue ${venueId}${instagramUrl ? ` from ${instagramUrl}` : ''}`);

      // Simulated scraped data
      const scrapedData = {
        venueId,
        source: 'instagram' as const,
        instagramBio: 'Scraped bio would appear here',
        photoUrls: [],
        instagramPosts: [],
        djNames: [],
        eventDetails: [],
      };

      await this.prisma.scrapedVenueData.create({ data: scrapedData });

      await this.prisma.scrapeJob.update({
        where: { id: job.id },
        data: { status: 'success', itemsSynced: 0, finishedAt: new Date() },
      });

      this.logger.log(`[Instagram] Completed venue ${venueId}`);
      return { status: 'success', message: 'Instagram scrape completed (simulated)' };
    } catch (error: any) {
      await this.prisma.scrapeJob.update({
        where: { id: job.id },
        data: { status: 'failed', errorMsg: error.message, finishedAt: new Date() },
      });
      this.logger.error(`[Instagram] Failed venue ${venueId}: ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  private async scrapeGoogle(venueId: string) {
    const job = await this.prisma.scrapeJob.create({
      data: { venueId, source: 'google', status: 'success' },
    });

    try {
      this.logger.log(`[Google] Scraping venue ${venueId}`);

      const scrapedData = {
        venueId,
        source: 'google' as const,
        address: 'Scraped address would appear here',
        rating: 4.0,
        priceRange: 2,
        openingHours: 'Mon-Sun: 6pm-2am',
        photoUrls: [],
      };

      await this.prisma.scrapedVenueData.create({ data: scrapedData as any });

      await this.prisma.scrapeJob.update({
        where: { id: job.id },
        data: { status: 'success', itemsSynced: 1, finishedAt: new Date() },
      });

      this.logger.log(`[Google] Completed venue ${venueId}`);
      return { status: 'success', message: 'Google scrape completed (simulated)' };
    } catch (error: any) {
      await this.prisma.scrapeJob.update({
        where: { id: job.id },
        data: { status: 'failed', errorMsg: error.message, finishedAt: new Date() },
      });
      this.logger.error(`[Google] Failed venue ${venueId}: ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  async getJobHistory(venueId?: string) {
    const where = venueId ? { venueId } : {};
    return this.prisma.scrapeJob.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  async getScrapedData(venueId: string) {
    return this.prisma.scrapedVenueData.findMany({
      where: { venueId },
      orderBy: { scrapedAt: 'desc' },
    });
  }

  async adminStats() {
    const [totalJobs, failedJobs, totalScraped] = await Promise.all([
      this.prisma.scrapeJob.count(),
      this.prisma.scrapeJob.count({ where: { status: 'failed' } }),
      this.prisma.scrapedVenueData.count(),
    ]);
    return { totalJobs, failedJobs, totalScraped };
  }

  // Scheduled: every 12 hours, re-scrape all venues
  @Cron(CronExpression.EVERY_12_HOURS)
  async scheduledScrape() {
    this.logger.log('[Scheduler] 12-hour scrape cycle starting...');
    try {
      const res = await fetch(`${this.venueUrl}/venues?limit=100`);
      const json = await res.json();
      const venues = json.data?.items || [];

      for (const venue of venues) {
        await this.scrapeVenue({ venueId: venue.id, source: 'both' });
        // Small delay between scrapes to avoid rate limiting
        await new Promise((r) => setTimeout(r, 2000));
      }

      this.logger.log(`[Scheduler] Completed scrape cycle for ${venues.length} venues`);
    } catch (error: any) {
      this.logger.error(`[Scheduler] Cycle failed: ${error.message}`);
    }
  }
}
