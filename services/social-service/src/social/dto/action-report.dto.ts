import { IsString, MaxLength } from 'class-validator';

export class ActionReportDto {
  @IsString()
  @MaxLength(50)
  actionTaken!: string;
}
