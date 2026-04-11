import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-z0-9_.]+$/, {
    message: 'Username can only contain lowercase letters, numbers, dots and underscores',
  })
  username!: string;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;
}
