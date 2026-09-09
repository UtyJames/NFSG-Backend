import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AdminRole, AdminUser } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async findAll() {
    return this.prisma.adminUser.findMany({
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        createdById: true,
        createdBy: {
          select: { fullName: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        createdBy: { select: { fullName: true } },
      },
    });
    if (!user) throw new NotFoundException('Admin user not found');
    return user;
  }

  async create(dto: CreateUserDto, createdBy: Partial<AdminUser>) {
    // Only SUPER_ADMIN can create users
    if (createdBy.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can create users');
    }

    // Check uniqueness
    const existing = await this.prisma.adminUser.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new BadRequestException(
        existing.email === dto.email
          ? 'Email already in use'
          : 'Username already taken',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.adminUser.create({
      data: {
        fullName: dto.fullName,
        username: dto.username,
        email: dto.email,
        passwordHash,
        role: dto.role || AdminRole.STAFF,
        createdById: createdBy.id,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Send welcome email with credentials
    await this.mail.sendAdminWelcome({
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      password: dto.password, // plain text for initial login only
      role: user.role,
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto, requestingUser: Partial<AdminUser>) {
    if (requestingUser.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can modify users');
    }

    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Admin user not found');

    const data: Record<string, unknown> = {};
    if (dto.fullName) data.fullName = dto.fullName;
    if (dto.username) data.username = dto.username;
    if (dto.email) data.email = dto.email;
    if (dto.role) data.role = dto.role;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.adminUser.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, requestingUser: Partial<AdminUser>) {
    if (requestingUser.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can delete users');
    }

    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Admin user not found');

    // Prevent deleting the super admin account itself if it's the last one
    if (user.role === AdminRole.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.adminUser.count({
        where: { role: AdminRole.SUPER_ADMIN },
      });
      if (superAdminCount <= 1) {
        throw new ForbiddenException('Cannot delete the last Super Admin account');
      }
    }

    await this.prisma.adminUser.delete({ where: { id } });
    return { message: 'Admin user deleted successfully' };
  }
}
