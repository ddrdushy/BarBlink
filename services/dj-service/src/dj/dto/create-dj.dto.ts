import { IsString, IsOptional, IsArray, IsIn, Length } from 'class-validator';

export class CreateDjDto {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @IsIn(['dj', 'band'])
  type?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genreTags?: string[];

  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;
}
