import type { Area, CrowdStatus, GpsPoint, ISODateTime, UUID } from './common';

export type VenueCategory = 'bar' | 'club' | 'rooftop' | 'live_music' | 'lounge' | 'speakeasy';

export interface Venue {
  id: UUID;
  name: string;
  category: VenueCategory;
  description?: string;
  address: string;
  gps: GpsPoint;
  area: Area;
  kitchenClosesAt?: string;
  barClosesAt: string;
  priceRange: 1 | 2 | 3 | 4;
  genres: string[];
  instagramHandle?: string;
  googleRating?: number;
  crowdCapacity: number;
  active: boolean;
  lastScrapedAt?: ISODateTime;
  createdAt: ISODateTime;
}

export interface VenueCrowd {
  venueId: UUID;
  activeCheckins: number;
  percent: number;
  status: CrowdStatus;
  updatedAt: ISODateTime;
}

export interface VenueSummary {
  id: UUID;
  name: string;
  category: VenueCategory;
  area: Area;
  heroImageUrl?: string;
  crowd: VenueCrowd;
  friendsHere: number;
  distanceMeters?: number;
  closesAt: string;
  rating?: number;
}
