import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UploadService } from '../upload/upload.service';
import { RegisterDistributorDto } from './dto/distributor.dto';
import { generateDistributorId, generateVerificationCode } from '../common/utils/id.util';

@Injectable()
export class DistributorsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private upload: UploadService,
  ) {}

  async register(dto: RegisterDistributorDto, file?: Express.Multer.File) {
    // Enforce unique RC number (same business can't register twice)
    const existing = await this.prisma.distributor.findFirst({
      where: { rcNumber: dto.rcNumber },
    });
    if (existing) {
      throw new BadRequestException(
        'This RC number is already registered as a distributor. Each business may only register once. ' +
          'Contact the Data Protection Desk if you believe this is a mistake.',
      );
    }

    // Upload NAIDA certificate if provided
    let naidaCertificateUrl: string | undefined;
    if (file) {
      naidaCertificateUrl = await this.upload.uploadFile(file, 'naida-certificates');
    }

    const distributorId = generateDistributorId();
    const verificationCode = generateVerificationCode();

    const distributor = await this.prisma.distributor.create({
      data: {
        distributorId,
        verificationCode,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        storeAddress: dto.storeAddress,
        state: dto.state,
        lgaCovered: dto.lgaCovered,
        companyName: dto.companyName,
        rcNumber: dto.rcNumber,
        naidaCertificateUrl,
      },
    });

    await this.mail.sendDistributorRegistrationSuccess({
      email: distributor.email,
      name: distributor.name,
      distributorId: distributor.distributorId,
      verificationCode: distributor.verificationCode,
      companyName: distributor.companyName,
      state: distributor.state,
      lgaCovered: distributor.lgaCovered,
    });

    return {
      distributorId: distributor.distributorId,
      verificationCode: distributor.verificationCode,
      status: distributor.status,
      companyName: distributor.companyName,
      state: distributor.state,
      lgaCovered: distributor.lgaCovered,
    };
  }
}
