import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('General')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check & service info' })
  getHealth() {
    return {
      status: 'ok',
      service: 'Nigerian Farmers Support Group (NFSG) API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      message: 'NFSG Backend API is running successfully 🌾',
    };
  }
}

