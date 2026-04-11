import { IsString, IsOptional } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
