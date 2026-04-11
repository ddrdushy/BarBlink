import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface VenueItem {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  area: string | null;
  country: string;
  lat: string | null;
  lng: string | null;
  barClosesAt: string | null;
  priceRange: number | null;
  googleRating: string | null;
  description: string | null;
  crowdCapacity: number | null;
}

interface CrowdData {
  venueId: string;
  count: number;
}

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);
  private venueUrl: string;
  private checkinUrl: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.venueUrl = this.config.get('VENUE_SERVICE_URL', 'http://localhost:3003/v1');
    this.checkinUrl = this.config.get('CHECKIN_SERVICE_URL', 'http://localhost:3006/v1');
  }

  async nearby(lat: number, lng: number, radius: number, category?: string, country?: string) {
    // Fetch all venues from venue-service
    const params = new URLSearchParams({ limit: '100' });
    if (country) params.set('country', country);
    if (category) params.set('category', category);

    const res = await fetch(`${this.venueUrl}/venues?${params}`);
    const json = await res.json();
    const venues: VenueItem[] = json.data?.items || [];

    // Filter by distance and sort
    const withDistance = venues
      .filter((v) => v.lat && v.lng)
      .map((v) => ({
        ...v,
        distance: this.haversine(lat, lng, parseFloat(v.lat!), parseFloat(v.lng!)),
      }))
      .filter((v) => v.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return { items: withDistance, total: withDistance.length };
  }

  async search(query: string, country?: string) {
    // Search venues by name/description via venue-service
    const params = new URLSearchParams({ limit: '50' });
    if (country) params.set('country', country);

    const res = await fetch(`${this.venueUrl}/venues?${params}`);
    const json = await res.json();
    const venues: VenueItem[] = json.data?.items || [];

    const q = query.toLowerCase();
    const matches = venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.description?.toLowerCase().includes(q)) ||
        (v.area?.toLowerCase().includes(q)) ||
        (v.category?.toLowerCase().includes(q)),
    );

    // Log search
    await this.prisma.searchLog.create({
      data: { query, results: matches.length },
    });

    return { items: matches, total: matches.length, query };
  }

  async mapData(country?: string) {
    // Get venues with GPS + crowd counts for map pins
    const params = new URLSearchParams({ limit: '100' });
    if (country) params.set('country', country);

    const res = await fetch(`${this.venueUrl}/venues?${params}`);
    const json = await res.json();
    const venues: VenueItem[] = json.data?.items || [];

    const withGps = venues.filter((v) => v.lat && v.lng);

    // Fetch crowd counts for each venue
    const pins = await Promise.all(
      withGps.map(async (v) => {
        let crowd = 0;
        try {
          const cr = await fetch(`${this.checkinUrl}/checkins/venue/${v.id}`);
          const cj = await cr.json();
          crowd = cj.data?.count || 0;
        } catch { /* silent */ }
        return {
          id: v.id,
          name: v.name,
          category: v.category,
          lat: parseFloat(v.lat!),
          lng: parseFloat(v.lng!),
          crowd,
          crowdStatus: crowd === 0 ? 'quiet' : crowd < (v.crowdCapacity || 100) * 0.5 ? 'lively' : 'packed',
        };
      }),
    );

    return { pins, total: pins.length };
  }

  async crowdForVenue(venueId: string) {
    try {
      const res = await fetch(`${this.checkinUrl}/checkins/venue/${venueId}`);
      const json = await res.json();
      return json.data || { venueId, count: 0 };
    } catch {
      return { venueId, count: 0 };
    }
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
