import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FarmersService } from './farmers.service';
import { RegisterFarmerDto } from './dto/farmer.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Farmers')
@Controller('farmers')
export class FarmersController {
  constructor(private farmersService: FarmersService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new farmer' })
  register(@Body() body: RegisterFarmerDto) {
    return this.farmersService.register(body);
  }

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Check registration / allocation status for a farmer' })
  @ApiQuery({ name: 'query', required: false, description: 'NIN, phone number, or registration code' })
  checkStatus(@Query('query') query: string) {
    if (!query) {
      return { found: false };
    }
    return this.farmersService.checkStatus(query);
  }
}

