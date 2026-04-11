import { IsUUID } from 'class-validator';

export class AddVenueDto {
  @IsUUID()
  venueId!: string;
}
