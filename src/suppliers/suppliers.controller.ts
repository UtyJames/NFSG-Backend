import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SuppliersService } from './suppliers.service';
import { RegisterSupplierDto } from './dto/supplier.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new supplier (with optional FISS certificate file)' })
  @ApiConsumes('multipart/form-data')
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

