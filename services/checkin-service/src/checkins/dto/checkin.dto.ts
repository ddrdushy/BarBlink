import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class CreateCheckinDto {
  @IsString()
  @IsUUID()
  venueId!: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
