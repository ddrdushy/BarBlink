import { IsString, IsOptional, IsUUID, IsNumber, IsDateString } from 'class-validator';

export class CreateAdDto {
  @IsOptional()
  @IsUUID()
  venueId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsString()
  targetArea?: string;

  @IsOptional()
  @IsString()
  targetCountry?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
