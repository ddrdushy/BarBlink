import { IsString, IsOptional, IsInt, IsDateString, Min, Max, Length } from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  date!: string;

  @IsString()
  @Length(1, 10)
  time!: string;

  @IsInt()
  @Min(1)
  @Max(50)
  partySize!: number;

  @IsString()
  @Length(1, 100)
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
