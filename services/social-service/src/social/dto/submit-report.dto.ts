import { IsString, IsUUID, IsIn } from 'class-validator';

export class SubmitReportDto {
  @IsString()
  @IsIn(['post', 'comment', 'user'])
  contentType!: string;

  @IsString()
  @IsUUID()
  contentId!: string;

  @IsString()
  @IsIn(['inappropriate', 'underage', 'spam', 'harassment', 'fake_venue'])
  reason!: string;
}
