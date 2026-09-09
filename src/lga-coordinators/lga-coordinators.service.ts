import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterLgaCoordinatorDto } from './dto/lga-coordinator.dto';
import { generateLgaCoordinatorId, generateVerificationCode } from '../common/utils/id.util';

@Injectable()
export class LgaCoordinatorsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterLgaCoordinatorDto) {
    // Check duplicate by NIN or phone
    const existing = await this.prisma.lgaCoordinator.findFirst({
      where: {
        OR: [{ nin: dto.nin }, { phoneNumber: dto.phoneNumber }],
      },
    });
    if (existing) {
      throw new BadRequestException(
        'A coordinator with this NIN or phone number is already registered.',
      );
    }

    const coordinatorId = generateLgaCoordinatorId();
    const verificationCode = generateVerificationCode();

    const coordinator = await this.prisma.lgaCoordinator.create({
      data: {
        coordinatorId,
        verificationCode,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        nin: dto.nin,
        appointmentSlipRef: dto.appointmentSlipRef,
        state: dto.state,
        lgaJurisdiction: dto.lgaJurisdiction,
      },
    });

    await this.mail.sendLgaCoordinatorRegistrationSuccess({
      email: coordinator.email,
      fullName: coordinator.fullName,
      coordinatorId: coordinator.coordinatorId,
      verificationCode: coordinator.verificationCode,
      state: coordinator.state,
      lgaJurisdiction: coordinator.lgaJurisdiction,
    });

    return {
      coordinatorId: coordinator.coordinatorId,
      verificationCode: coordinator.verificationCode,
      status: coordinator.status,
      state: coordinator.state,
      lgaJurisdiction: coordinator.lgaJurisdiction,
    };
  }
}
