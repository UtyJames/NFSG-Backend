import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FarmersModule } from './farmers/farmers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { DistributorsModule } from './distributors/distributors.module';
import { LgaCoordinatorsModule } from './lga-coordinators/lga-coordinators.module';
import { AdminModule } from './admin/admin.module';
import { PublicModule } from './public/public.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    UploadModule,
    AuthModule,
    UsersModule,
    FarmersModule,
    SuppliersModule,
    DistributorsModule,
    LgaCoordinatorsModule,
    AdminModule,
    PublicModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
