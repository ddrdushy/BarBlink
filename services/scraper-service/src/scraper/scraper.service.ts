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
      this.logger.log(`[Instagram] Scraping venue ${venueId}${instagramUrl ? ` from ${instagramUrl}` : ''}`);

      const { chromium } = await import('playwright');
      const browser = await chromium.launch({
        headless: this.config.get('PLAYWRIGHT_HEADLESS', 'true') === 'true',
      });
      const page = await browser.newPage();

      let bio = '';
      const photoUrls: string[] = [];
      const postCaptions: string[] = [];
      const djNames: string[] = [];

      if (instagramUrl) {
        try {
          await page.goto(instagramUrl, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(2000);

          // Extract bio
          const bioEl = await page.$('header section > div.-vDIg span, header section div[class*="biography"] span');
          if (bioEl) bio = (await bioEl.textContent()) || '';

          // Extract recent post images
          const imgs = await page.$$('article img[src*="instagram"]');
          for (const img of imgs.slice(0, 12)) {
            const src = await img.getAttribute('src');
            if (src) photoUrls.push(src);
          }

          // Extract post captions for DJ name detection
          const metaTags = await page.$$('meta[property="og:description"]');
          for (const meta of metaTags) {
            const content = await meta.getAttribute('content');
            if (content) {
              postCaptions.push(content);
              // Simple DJ name detection from captions
              const djMatch = content.match(/(?:feat|ft|featuring|dj|DJ|with)\s+([A-Z][a-zA-Z\s]+)/);
              if (djMatch) djNames.push(djMatch[1].trim());
            }
          }
        } catch (navError: any) {
          this.logger.warn(`[Instagram] Navigation failed: ${navError.message}. Using fallback.`);
        }
      }

      await browser.close();

      const scrapedData = {
        venueId,
        source: 'instagram' as const,
        instagramBio: bio || null,
        photoUrls,
        instagramPosts: postCaptions,
        djNames: [...new Set(djNames)],
        eventDetails: [],
      };

      await this.prisma.scrapedVenueData.create({ data: scrapedData });

      const itemsSynced = photoUrls.length + (bio ? 1 : 0);
      await this.prisma.scrapeJob.update({
        where: { id: job.id },
        data: { status: 'success', itemsSynced, finishedAt: new Date() },
      });

      this.logger.log(`[Instagram] Completed venue ${venueId}: ${itemsSynced} items`);
      return { status: 'success', itemsSynced, bio: bio.slice(0, 100), photos: photoUrls.length };
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

      // Fetch venue name from venue-service to search Google
      let venueName = '';
      try {
        const res = await fetch(`${this.venueUrl}/venues/${venueId}`);
        const json = await res.json();
        venueName = json.data?.name || '';
      } catch { /* silent */ }

      const { chromium } = await import('playwright');
      const browser = await chromium.launch({
        headless: this.config.get('PLAYWRIGHT_HEADLESS', 'true') === 'true',
      });
      const page = await browser.newPage();

      let address = '';
      let rating: number | null = null;
      let phone = '';
      let openingHours = '';

      if (venueName) {
        try {
          const searchQuery = encodeURIComponent(`${venueName} bar restaurant`);
          await page.goto(`https://www.google.com/search?q=${searchQuery}`, {
            waitUntil: 'networkidle',
            timeout: 30000,
          });
          await page.waitForTimeout(2000);

          // Extract address from knowledge panel
          const addressEl = await page.$('[data-attrid="kc:/location/location:address"] .LrzXr, .LrzXr');
          if (addressEl) address = (await addressEl.textContent()) || '';

          // Extract rating
          const ratingEl = await page.$('[data-attrid="kc:/collection/knowledge_panels/has_ratings:ratings"] .Aq14fc, .yi40Hd.YrbPuc');
          if (ratingEl) {
            const ratingText = (await ratingEl.textContent()) || '';
            const parsed = parseFloat(ratingText);
            if (!isNaN(parsed)) rating = parsed;
          }

          // Extract phone
          const phoneEl = await page.$('[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"] .LrzXr');
          if (phoneEl) phone = (await phoneEl.textContent()) || '';

          // Extract opening hours
          const hoursEl = await page.$('[data-attrid="kc:/location/location:hours"] .LrzXr');
          if (hoursEl) openingHours = (await hoursEl.textContent()) || '';

        } catch (navError: any) {
          this.logger.warn(`[Google] Search failed: ${navError.message}. Using fallback.`);
        }
      }

      await browser.close();

      const scrapedData = {
        venueId,
        source: 'google' as const,
        name: venueName || null,
        address: address || null,
        phone: phone || null,
        rating: rating,
        openingHours: openingHours || null,
        photoUrls: [],
      };

      await this.prisma.scrapedVenueData.create({ data: scrapedData as any });

      const itemsSynced = (address ? 1 : 0) + (rating ? 1 : 0) + (phone ? 1 : 0);
      await this.prisma.scrapeJob.update({
        where: { id: job.id },
        data: { status: 'success', itemsSynced, finishedAt: new Date() },
      });

      this.logger.log(`[Google] Completed venue ${venueId}: ${itemsSynced} items`);
      return { status: 'success', itemsSynced, address, rating };
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
