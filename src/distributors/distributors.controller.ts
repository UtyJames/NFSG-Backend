import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DistributorsService } from './distributors.service';
import { RegisterDistributorDto } from './dto/distributor.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('distributors')
export class DistributorsController {
  constructor(private distributorsService: DistributorsService) {}

  @Public()
  @Post('register')
  @UseInterceptors(
    FileInterceptor('naidaCertificate', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  register(
    @Body() body: RegisterDistributorDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.distributorsService.register(body, file);
  }
}
