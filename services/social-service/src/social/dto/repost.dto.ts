import { IsOptional, IsString } from 'class-validator';

export class RepostDto {
  @IsOptional()
  @IsString()
  caption?: string;
}
