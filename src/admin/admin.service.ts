import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegistrationsFilterDto, UpdateStatusDto } from './dto/admin.dto';
import { RegistrationStatus } from '@prisma/client';

type RegistrationType = 'farmer' | 'supplier' | 'distributor' | 'lga-coordinator';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  // ─── Dashboard Metrics ──────────────────────────────────────────────────────

  async getDashboardStats() {
    const [farmers, suppliers, distributors, lgaCoordinators] = await Promise.all([
      this.prisma.farmer.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.supplier.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.distributor.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.lgaCoordinator.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const toMap = (groups: { status: RegistrationStatus; _count: { _all: number } }[]) => ({
      total: groups.reduce((s, g) => s + g._count._all, 0),
      pending: groups.find(g => g.status === 'PENDING')?._count._all || 0,
      approved: groups.find(g => g.status === 'APPROVED')?._count._all || 0,
      declined: groups.find(g => g.status === 'DECLINED')?._count._all || 0,
    });

    return {
      farmers: toMap(farmers),
      suppliers: toMap(suppliers),
      distributors: toMap(distributors),
      lgaCoordinators: toMap(lgaCoordinators),
    };
  }

  // ─── List All Registrations (paginated + filtered) ──────────────────────────

  async listRegistrations(filter: RegistrationsFilterDto) {
    const page = filter.page ?? 1;
    const limit = Math.min(filter.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const types: RegistrationType[] = filter.type
      ? [filter.type]
      : ['farmer', 'supplier', 'distributor', 'lga-coordinator'];

    const results: unknown[] = [];

    for (const type of types) {
      const records = await this.queryType(type, filter, skip, limit);
      results.push(...records.map(r => ({ ...r, _type: type })));
    }

    // Sort combined results by createdAt desc
    results.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      data: results.slice(0, limit),
      page,
      limit,
      total: results.length,
    };
  }

  private async queryType(
    type: RegistrationType,
    filter: RegistrationsFilterDto,
    skip: number,
    take: number,
  ) {
    const where: Record<string, unknown> = {};
    if (filter.status) where.status = filter.status;
    if (filter.state) where.state = { equals: filter.state, mode: 'insensitive' };

    switch (type) {
      case 'farmer': {
        if (filter.search) {
          where.OR = [
            { fullName: { contains: filter.search, mode: 'insensitive' } },
            { memberId: { contains: filter.search, mode: 'insensitive' } },
            { phoneNumber: { contains: filter.search } },
          ];
        }
        return this.prisma.farmer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
      }
      case 'supplier': {
        if (filter.search) {
          where.OR = [
            { repName: { contains: filter.search, mode: 'insensitive' } },
            { companyName: { contains: filter.search, mode: 'insensitive' } },
            { supplierId: { contains: filter.search, mode: 'insensitive' } },
            { phoneNumber: { contains: filter.search } },
          ];
        }
        return this.prisma.supplier.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
      }
      case 'distributor': {
        if (filter.search) {
          where.OR = [
            { name: { contains: filter.search, mode: 'insensitive' } },
            { companyName: { contains: filter.search, mode: 'insensitive' } },
            { distributorId: { contains: filter.search, mode: 'insensitive' } },
            { phoneNumber: { contains: filter.search } },
          ];
        }
        return this.prisma.distributor.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
      }
      case 'lga-coordinator': {
        if (filter.search) {
          where.OR = [
            { fullName: { contains: filter.search, mode: 'insensitive' } },
            { coordinatorId: { contains: filter.search, mode: 'insensitive' } },
            { phoneNumber: { contains: filter.search } },
          ];
        }
        return this.prisma.lgaCoordinator.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
      }
    }
  }

  // ─── Get Single Registration ─────────────────────────────────────────────

  async getRegistration(type: RegistrationType, id: string) {
    let record: unknown = null;

    switch (type) {
      case 'farmer':
        record = await this.prisma.farmer.findUnique({ where: { id } });
        break;
      case 'supplier':
        record = await this.prisma.supplier.findUnique({ where: { id } });
        break;
      case 'distributor':
        record = await this.prisma.distributor.findUnique({ where: { id } });
        break;
      case 'lga-coordinator':
        record = await this.prisma.lgaCoordinator.findUnique({ where: { id } });
        break;
      default:
        throw new BadRequestException('Invalid registration type');
    }

    if (!record) throw new NotFoundException(`${type} registration not found`);
    return { ...record as object, _type: type };
  }

  // ─── Update Registration Status ──────────────────────────────────────────

  async updateStatus(type: RegistrationType, id: string, dto: UpdateStatusDto) {
    const updateData = { status: dto.status, adminNote: dto.note ?? null };
    let updated: any;

    switch (type) {
      case 'farmer':
        updated = await this.prisma.farmer.update({ where: { id }, data: updateData });
        if (updated.email) {
          await this.mail.sendStatusUpdate({
            email: updated.email,
            name: updated.fullName,
            registrationId: updated.memberId,
            registrationType: 'Farmer',
            status: dto.status as 'APPROVED' | 'DECLINED',
            note: dto.note,
          });
        }
        break;

      case 'supplier':
        updated = await this.prisma.supplier.update({ where: { id }, data: updateData });
        await this.mail.sendStatusUpdate({
          email: updated.email,
          name: updated.repName,
          registrationId: updated.supplierId,
          registrationType: 'Supplier',
          status: dto.status as 'APPROVED' | 'DECLINED',
          note: dto.note,
        });
        break;

      case 'distributor':
        updated = await this.prisma.distributor.update({ where: { id }, data: updateData });
        await this.mail.sendStatusUpdate({
          email: updated.email,
          name: updated.name,
          registrationId: updated.distributorId,
          registrationType: 'Distributor',
          status: dto.status as 'APPROVED' | 'DECLINED',
          note: dto.note,
        });
        break;

      case 'lga-coordinator':
        updated = await this.prisma.lgaCoordinator.update({ where: { id }, data: updateData });
        await this.mail.sendStatusUpdate({
          email: updated.email,
          name: updated.fullName,
          registrationId: updated.coordinatorId,
          registrationType: 'LGA Coordinator',
          status: dto.status as 'APPROVED' | 'DECLINED',
          note: dto.note,
        });
        break;

      default:
        throw new BadRequestException('Invalid registration type');
    }

    return { ...updated, _type: type };
  }
}
