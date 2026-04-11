import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyQueryDto {
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lng!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(50000)
  radius?: number = 5000; // meters

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class SearchQueryDto {
  @IsString()
  q!: string;

  @IsOptional()
  @IsString()
  country?: string;
}
