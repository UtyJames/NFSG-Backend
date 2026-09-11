import {
  IsArray,
  IsOptional,
  IsEmail,
  IsString,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return value.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  inputAvailable: string[];

  @IsString()
  taxNumber: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  fissCertificatePhotoKey?: string;

  @IsOptional()
  @IsString()
  fissCertificateUrl?: string;
}

