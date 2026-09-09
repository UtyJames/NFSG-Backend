import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LgaCoordinatorsService } from './lga-coordinators.service';
 import { RegisterLgaCoordinatorDto } from './dto/lga-coordinator.dto';
 import { Public } from '../common/decorators/public.decorator';

@ApiTags('LGA Coordinators')
@Controller('lga-coordinators')
export class LgaCoordinatorsController {
  constructor(private lgaCoordinatorsService: LgaCoordinatorsService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new LGA coordinator' })
  register(@Body() body: RegisterLgaCoordinatorDto) {
    return this.lgaCoordinatorsService.register(body);
  }
}

