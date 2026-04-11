import type { ISODateTime, UUID } from './common';

export type PostType = 'photo' | 'video' | 'drink_rating' | 'poll';

export interface Post {
  id: UUID;
  authorId: UUID;
  venueId?: UUID;
  type: PostType;
  mediaUrls: string[];
  caption?: string;
  drinkName?: string;
  drinkRating?: 1 | 2 | 3 | 4 | 5;
  likeCount: number;
  commentCount: number;
  createdAt: ISODateTime;
}

export interface Story {
  id: UUID;
  authorId: UUID;
  mediaUrl: string;
  venueId?: UUID;
  expiresAt: ISODateTime;
  createdAt: ISODateTime;
}
