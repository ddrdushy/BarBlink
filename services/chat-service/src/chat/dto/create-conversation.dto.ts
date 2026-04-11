import { IsString, IsOptional, IsArray, IsIn, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsIn(['dm', 'group'])
  type!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  memberIds!: string[];

  @IsOptional()
  @IsString()
  name?: string;
}
