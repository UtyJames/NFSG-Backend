import { Module } from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { FarmersController } from './farmers.controller';

@Module({
  providers: [FarmersService],
  controllers: [FarmersController],
})
export class FarmersModule {}
