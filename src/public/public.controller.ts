import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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

@Public()
@Controller()
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('homepage-metrics')
  getHomepageMetrics() {
    return this.publicService.getHomepageMetrics();
  }

  @Get('status')
  checkStatus(@Query('code') code: string) {
    if (!code) return { found: false };
    return this.publicService.checkByCode(code);
  }

  @Post('public/allocation-search')
  searchAllocation(@Body() body: AllocationSearchDto) {
    return this.publicService.searchAllocation(body.query);
  }

  @Post('newsletter/subscribe')
  subscribeNewsletter(@Body() body: NewsletterDto) {
    return this.publicService.subscribeNewsletter(body.email);
  }

  @Post('assistant/ask')
  askAssistant(@Body() body: AssistantDto) {
    return this.publicService.ask(body.message);
  }
}
