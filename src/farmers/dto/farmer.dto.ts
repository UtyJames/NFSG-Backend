import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterFarmerDto {
  @IsString()
  fullName: string;

  @IsString()
  @Matches(/^0\d{10}$/, { message: 'Phone must be 11-digit Nigerian number starting with 0' })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsEnum(['NIN', 'VIN'])
  idType: 'NIN' | 'VIN';

  @IsString()
  idNumber: string;

  @IsString()
  state: string;

  @IsString()
  lga: string;

  @IsString()
  ward: string;

  @IsString()
  commodity: string;

  @IsString()
  farmSize: string;

  @IsString()
  @IsOptional()
  groupLeaderName?: string;
}

export class CheckStatusDto {
  @IsString()
  query: string; // phone number or memberId
}
