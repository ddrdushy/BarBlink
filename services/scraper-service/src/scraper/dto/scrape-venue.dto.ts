import { IsString, IsUUID, IsOptional, IsIn } from 'class-validator';

export class ScrapeVenueDto {
  @IsUUID()
  venueId!: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(['instagram', 'google', 'both'])
  source?: string = 'both';
}
