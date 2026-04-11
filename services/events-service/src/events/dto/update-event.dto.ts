import { IsString, IsOptional, IsNumber, IsIn, Length } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsString()
  djId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  coverCharge?: number;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @IsOptional()
  @IsString()
  @IsIn(['upcoming', 'ongoing', 'ended', 'cancelled'])
  status?: string;
}
