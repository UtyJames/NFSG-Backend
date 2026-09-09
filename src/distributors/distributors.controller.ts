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
import { DistributorsService } from './distributors.service';
import { RegisterDistributorDto } from './dto/distributor.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Distributors')
@Controller('distributors')
export class DistributorsController {
  constructor(private distributorsService: DistributorsService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new distributor (with optional NAIDA certificate file)' })
  @ApiConsumes('multipart/form-data')
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

