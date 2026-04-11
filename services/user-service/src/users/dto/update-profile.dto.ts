import { IsString, IsOptional, IsArray, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 60)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  drinkPrefs?: string[];
}
