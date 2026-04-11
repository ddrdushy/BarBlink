import { IsString, IsEmail, IsDateString, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone must be in international format (e.g. +60123456789 or +94771234567)',
  })
  phone!: string;

  @IsEmail()
  email!: string;

  @IsDateString()
  dateOfBirth!: string;
}
