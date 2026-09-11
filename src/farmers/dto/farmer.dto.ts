import {
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class RegisterFarmerDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsString()
  @Matches(/^0\d{10}$/, { message: 'Phone must be 11-digit Nigerian number starting with 0' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  idType?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

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

  @IsOptional()
  @IsString()
  groupLeaderName?: string;

  @IsOptional()
  @IsString()
  leaderPhoneNumber?: string;

  @IsOptional()
  @IsString()
  farmersAssociation?: string;
}

export class UpdateFarmerDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @Matches(/^0\d{10}$/, { message: 'Phone must be 11-digit Nigerian number starting with 0' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  idType?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  lga?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  commodity?: string;

  @IsOptional()
  @IsString()
  farmSize?: string;

  @IsOptional()
  @IsString()
  groupLeaderName?: string;

  @IsOptional()
  @IsString()
  leaderPhoneNumber?: string;

  @IsOptional()
  @IsString()
  farmersAssociation?: string;
}

export class CheckStatusDto {
  @IsString()
  query: string;
}
