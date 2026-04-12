import { IsString, IsOptional, IsNumber, IsArray, Matches, Min, Max, Length } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vibeTags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genreTags?: string[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  area!: string;

  @IsString()
  @Length(2, 2)
  country!: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsString()
  @Matches(/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/, {
    message: 'Must be a valid Instagram URL',
  })
  instagramUrl!: string;

  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @IsString()
  barClosesAt!: string;

  @IsOptional()
  @IsString()
  kitchenClosesAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  priceRange?: number;

  @IsNumber()
  @Min(1)
  crowdCapacity!: number;

  @IsOptional()
  @IsNumber()
  googleRating?: number;

  @IsOptional()
  @IsString()
  coverPhotoUrl?: string;
}
