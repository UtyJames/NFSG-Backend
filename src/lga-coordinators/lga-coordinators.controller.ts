import { Body, Controller, Post } from '@nestjs/common';
import { LgaCoordinatorsService } from './lga-coordinators.service';
import { RegisterLgaCoordinatorDto } from './dto/lga-coordinator.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('lga-coordinators')
export class LgaCoordinatorsController {
  constructor(private lgaCoordinatorsService: LgaCoordinatorsService) {}

  @Public()
  @Post('register')
  register(@Body() body: RegisterLgaCoordinatorDto) {
    return this.lgaCoordinatorsService.register(body);
  }
}
