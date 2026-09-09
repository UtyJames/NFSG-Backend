import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterFarmerDto } from './dto/farmer.dto';
import { generateId, generateVerificationCode } from '../common/utils/id.util';

@Injectable()
export class FarmersService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterFarmerDto) {
    // Check for duplicate registration (by phone + idNumber combination)
    const existing = await this.prisma.farmer.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.phoneNumber },
          { idNumber: dto.idNumber },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A registration already exists with this phone number or ID number. ' +
          'Use your Member ID or verification code to check your status.',
      );
    }

    const memberId = generateId('NFSG', 2026);
    const verificationCode = generateVerificationCode();

    const farmer = await this.prisma.farmer.create({
      data: {
        memberId,
        verificationCode,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        idType: dto.idType,
        idNumber: dto.idNumber,
        state: dto.state,
        lga: dto.lga,
        ward: dto.ward,
        commodity: dto.commodity,
        farmSize: dto.farmSize,
        groupLeaderName: dto.groupLeaderName,
      },
    });

    // Send confirmation email if email provided
    if (farmer.email) {
      await this.mail.sendFarmerRegistrationSuccess({
        email: farmer.email,
        fullName: farmer.fullName,
        memberId: farmer.memberId,
        verificationCode: farmer.verificationCode,
        state: farmer.state,
        lga: farmer.lga,
      });
    }

    return {
      memberId: farmer.memberId,
      verificationCode: farmer.verificationCode,
      status: farmer.status,
      fullName: farmer.fullName,
      state: farmer.state,
      lga: farmer.lga,
      ward: farmer.ward,
      commodity: farmer.commodity,
    };
  }

  async checkStatus(query: string) {
    const trimmed = query.trim();

    const farmer = await this.prisma.farmer.findFirst({
      where: {
        OR: [
          { phoneNumber: trimmed },
          { memberId: trimmed },
          { verificationCode: trimmed },
        ],
      },
      select: {
        memberId: true,
        fullName: true,
        phoneNumber: true,
        state: true,
        lga: true,
        ward: true,
        commodity: true,
        status: true,
        verificationCode: true,
        createdAt: true,
      },
    });

    if (!farmer) {
      return { found: false };
    }

    return {
      found: true,
      memberId: farmer.memberId,
      fullName: farmer.fullName,
      phoneNumber: farmer.phoneNumber,
      location: `${farmer.state} | ${farmer.lga} | ${farmer.ward}`,
      commodity: farmer.commodity,
      status: farmer.status,
      registeredAt: farmer.createdAt,
    };
  }
}
