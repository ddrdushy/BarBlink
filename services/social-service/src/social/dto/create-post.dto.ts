import { IsString, IsOptional, IsUUID, IsIn, IsNumber, Min, Max, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  venueId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['photo', 'drink_rating', 'poll', 'repost'])
  type?: string;

  @IsOptional()
  @IsString()
  drinkName?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  drinkRating?: number;

  @IsOptional()
  @IsArray()
  pollOptions?: string[];
}
