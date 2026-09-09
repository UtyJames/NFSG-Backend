import { IsEmail, IsString, Matches } from 'class-validator';

export class RegisterLgaCoordinatorDto {
  @IsString()
  fullName: string;

  @IsString()
  @Matches(/^0\d{10}$/, { message: 'Phone must be 11-digit Nigerian number starting with 0' })
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'NIN must be 11 digits' })
  nin: string;

  @IsString()
  appointmentSlipRef: string;

  @IsString()
  state: string;

  @IsString()
  lgaJurisdiction: string;
}
