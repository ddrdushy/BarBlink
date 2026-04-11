import type { ISODate, ISODateTime, UUID } from './common';

export type UserStatus = 'active' | 'suspended' | 'banned';

export interface UserAuth {
  id: UUID;
  phone: string;
  phoneVerified: boolean;
  dateOfBirth: ISODate;
  is18Plus: boolean;
  googleId?: string;
  appleId?: string;
  status: UserStatus;
  createdAt: ISODateTime;
}

export interface UserProfile {
  id: UUID;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  drinkPreferences?: string[];
  goingTonightVenueId?: UUID;
  streakDays: number;
  totalCheckins: number;
  venuesVisited: number;
  createdAt: ISODateTime;
}

export interface FriendEdge {
  userId: UUID;
  followerId: UUID;
  createdAt: ISODateTime;
}
