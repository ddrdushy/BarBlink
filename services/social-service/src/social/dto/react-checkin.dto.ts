import { IsString, MaxLength } from 'class-validator';

export class ReactCheckinDto {
  @IsString()
  @MaxLength(10)
  emoji!: string;
}
