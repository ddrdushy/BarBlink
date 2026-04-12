import { IsString, IsUUID, IsIn } from 'class-validator';

export class FollowActionDto {
  @IsUUID()
  userId!: string;
}

export class FollowResponseDto {
  @IsIn(['accepted', 'rejected'])
  action!: string;
}
