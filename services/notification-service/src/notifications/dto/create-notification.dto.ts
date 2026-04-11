import { IsString, IsOptional, IsUUID, IsIn, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @IsIn(['like', 'comment', 'checkin', 'follow', 'event'])
  type!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
