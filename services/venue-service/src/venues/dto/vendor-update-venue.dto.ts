import { IsString, IsOptional } from 'class-validator';

/**
 * Only fields vendors are allowed to edit on their own venue.
 * Admin-controlled fields (name, area, country, instagramUrl, etc.) are excluded.
 */
export class VendorUpdateVenueDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  barClosesAt?: string;

  @IsOptional()
  @IsString()
  kitchenClosesAt?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  coverPhotoUrl?: string;
}
