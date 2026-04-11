import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  venueId?: string;
}
