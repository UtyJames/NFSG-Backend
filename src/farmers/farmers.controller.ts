import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { RegisterFarmerDto } from './dto/farmer.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('farmers')
export class FarmersController {
  constructor(private farmersService: FarmersService) {}

  @Public()
  @Post('register')
  register(@Body() body: RegisterFarmerDto) {
    return this.farmersService.register(body);
  }

  @Public()
  @Get('status')
  checkStatus(@Query('query') query: string) {
    if (!query) {
      return { found: false };
    }
    return this.farmersService.checkStatus(query);
  }
}
