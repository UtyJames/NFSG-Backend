import { Module } from '@nestjs/common';
import { LgaCoordinatorsService } from './lga-coordinators.service';
import { LgaCoordinatorsController } from './lga-coordinators.controller';

@Module({
  providers: [LgaCoordinatorsService],
  controllers: [LgaCoordinatorsController],
})
export class LgaCoordinatorsModule {}
