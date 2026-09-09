import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UploadService } from '../upload/upload.service';
import { RegisterSupplierDto } from './dto/supplier.dto';
import { generateSupplierId, generateVerificationCode } from '../common/utils/id.util';

@Injectable()
export class SuppliersService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private upload: UploadService,
  ) {}

  async register(dto: RegisterSupplierDto, file?: Express.Multer.File) {
    // Enforce unique RC number
    const existing = await this.prisma.supplier.findFirst({
      where: { rcNumber: dto.rcNumber },
    });
    if (existing) {
      throw new BadRequestException(
        'This RC number is already registered. Each business may only register once. ' +
          'Contact the Data Protection Desk if you believe this is a mistake.',
      );
    }

    // Upload FISS certificate if provided
    let fissCertificateUrl: string | undefined;
    if (file) {
      fissCertificateUrl = await this.upload.uploadFile(file, 'fiss-certificates');
    }

    const supplierId = generateSupplierId();
    const verificationCode = generateVerificationCode();

    const supplier = await this.prisma.supplier.create({
      data: {
        supplierId,
        verificationCode,
        repName: dto.repName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        nin: dto.nin,
        companyName: dto.companyName,
        rcNumber: dto.rcNumber,
        regulatoryBody: dto.regulatoryBody,
        regulatoryBodyRegNumber: dto.regulatoryBodyRegNumber,
        inputAvailable: dto.inputAvailable,
        fissCertificateUrl,
        taxNumber: dto.taxNumber,
        address: dto.address,
      },
    });

    await this.mail.sendSupplierRegistrationSuccess({
      email: supplier.email,
      repName: supplier.repName,
      supplierId: supplier.supplierId,
      verificationCode: supplier.verificationCode,
      companyName: supplier.companyName,
    });

    return {
      supplierId: supplier.supplierId,
      verificationCode: supplier.verificationCode,
      status: supplier.status,
      companyName: supplier.companyName,
    };
  }
}
