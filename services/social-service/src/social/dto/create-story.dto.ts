import { IsString, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  mediaUrl!: string;

  @IsString()
  @IsIn(['image', 'video'])
  mediaType!: string;

  @IsOptional()
  @IsUUID()
  venueId?: string;
}
