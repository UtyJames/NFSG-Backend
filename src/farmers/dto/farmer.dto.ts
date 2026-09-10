import {
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class RegisterFarmerDto {
  @IsString()
  fullName: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @Matches(/^0\d{10}$/, { message: 'Phone must be 11-digit Nigerian number starting with 0' })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  idType?: string;

  @IsString()
  @IsOptional()
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

  @IsString()
  @IsOptional()
  groupLeaderName?: string;

  @IsString()
  @IsOptional()
  leaderPhoneNumber?: string;

  @IsString()
  @IsOptional()
  farmersAssociation?: string;
}

export class UpdateFarmerDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  @Matches(/^0\d{10}$/, { message: 'Phone must be 11-digit Nigerian number starting with 0' })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  idType?: string;

  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  lga?: string;

  @IsString()
  @IsOptional()
  ward?: string;

  @IsString()
  @IsOptional()
  commodity?: string;

  @IsString()
  @IsOptional()
  farmSize?: string;

  @IsString()
  @IsOptional()
  groupLeaderName?: string;

  @IsString()
  @IsOptional()
  leaderPhoneNumber?: string;

  @IsString()
  @IsOptional()
  farmersAssociation?: string;
}

export class CheckStatusDto {
  @IsString()
  query: string;
}
