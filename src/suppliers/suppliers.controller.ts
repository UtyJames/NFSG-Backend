import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SuppliersService } from './suppliers.service';
import { RegisterSupplierDto } from './dto/supplier.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Public()
  @Post('register')
  @UseInterceptors(
    FileInterceptor('fissCertificatePhoto', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  register(
    @Body() body: RegisterSupplierDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.suppliersService.register(body, file);
  }
}
