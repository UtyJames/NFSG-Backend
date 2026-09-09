import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { Public } from '../common/decorators/public.decorator';
import { IsEmail, IsString } from 'class-validator';

class NewsletterDto {
  @IsEmail()
  email: string;
}

class AllocationSearchDto {
  @IsString()
  query: string;
}

class AssistantDto {
  @IsString()
  message: string;
}

@ApiTags('Public')
@Public()
@Controller()
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('homepage-metrics')
  @ApiOperation({ summary: 'Get live statistics/metrics for the public landing page' })
  getHomepageMetrics() {
    return this.publicService.getHomepageMetrics();
  }

  @Get('status')
  @ApiOperation({ summary: 'Check registration status by registration code' })
  @ApiQuery({ name: 'code', required: false, description: 'Registration reference code' })
  checkStatus(@Query('code') code: string) {
    if (!code) return { found: false };
    return this.publicService.checkByCode(code);
  }

  @Post('public/allocation-search')
  @ApiOperation({ summary: 'Search allocations for public lookup' })
  searchAllocation(@Body() body: AllocationSearchDto) {
    return this.publicService.searchAllocation(body.query);
  }

  @Post('newsletter/subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  subscribeNewsletter(@Body() body: NewsletterDto) {
    return this.publicService.subscribeNewsletter(body.email);
  }

  @Post('assistant/ask')
  @ApiOperation({ summary: 'Ask the NFSG AI Assistant a question' })
  askAssistant(@Body() body: AssistantDto) {
    return this.publicService.ask(body.message);
  }
}

