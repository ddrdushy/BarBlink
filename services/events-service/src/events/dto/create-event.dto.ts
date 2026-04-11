import { IsString, IsOptional, IsNumber, IsIn, Length } from 'class-validator';

export class CreateEventDto {
  @IsString()
  venueId!: string;

  @IsOptional()
  @IsString()
  djId?: string;

  @IsString()
  @Length(1, 200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  date!: string;

  @IsString()
  startTime!: string;

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
