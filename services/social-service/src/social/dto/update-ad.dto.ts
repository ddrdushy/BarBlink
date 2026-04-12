import { IsString, IsOptional, IsNumber, IsIn, IsDateString } from 'class-validator';

export class UpdateAdDto {
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'active', 'paused', 'completed'])
  status?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  title?: string;

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
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
