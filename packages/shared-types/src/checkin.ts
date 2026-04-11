import type { ISODateTime, UUID } from './common';

export interface Checkin {
  id: UUID;
  userId: UUID;
  venueId: UUID;
  groupId?: UUID;
  checkedInAt: ISODateTime;
  expiresAt: ISODateTime;
  leftAt?: ISODateTime;
}

export interface CheckinGroup {
  id: UUID;
  leaderId: UUID;
  venueId: UUID;
  memberIds: UUID[];
  createdAt: ISODateTime;
}
