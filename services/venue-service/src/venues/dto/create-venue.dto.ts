import { IsString, IsOptional, IsNumber, IsArray, Min, Max, Length } from 'class-validator';

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

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @IsOptional()
  @IsString()
  barClosesAt?: string;

  @IsOptional()
  @IsString()
  kitchenClosesAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  priceRange?: number;

  @IsOptional()
  @IsNumber()
  crowdCapacity?: number;

  @IsOptional()
  @IsNumber()
  googleRating?: number;

  @IsOptional()
  @IsString()
  coverPhotoUrl?: string;
}
