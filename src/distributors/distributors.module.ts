import { Module } from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import { DistributorsController } from './distributors.controller';

@Module({
  providers: [DistributorsService],
  controllers: [DistributorsController],
})
export class DistributorsModule {}
