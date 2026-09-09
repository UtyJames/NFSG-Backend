import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class RegisterSupplierDto {
  @IsString()
  repName: string;

  @IsString()
  @Matches(/^0\d{10}$/, { message: 'Phone must be 11-digit Nigerian number starting with 0' })
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'NIN must be 11 digits' })
  nin: string;

  @IsString()
  companyName: string;

  @IsString()
  rcNumber: string;

  @IsString()
  regulatoryBody: string;

  @IsString()
  regulatoryBodyRegNumber: string;

  @IsArray()
  @IsString({ each: true })
  inputAvailable: string[];

  @IsString()
  taxNumber: string;

  @IsString()
  address: string;
}
