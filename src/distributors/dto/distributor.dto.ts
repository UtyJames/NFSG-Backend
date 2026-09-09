import { IsEmail, IsString, Matches } from 'class-validator';

export class RegisterDistributorDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^0\d{10}$/, { message: 'Phone must be 11-digit Nigerian number starting with 0' })
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  storeAddress: string;

  @IsString()
  state: string;

  @IsString()
  lgaCovered: string;

  @IsString()
  companyName: string;

  @IsString()
  rcNumber: string;
}
