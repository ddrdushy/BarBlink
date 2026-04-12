import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CreateGroupCheckinDto {
  @IsString()
  @IsUUID()
  venueId!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds?: string[];
}
