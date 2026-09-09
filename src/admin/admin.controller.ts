import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RegistrationsFilterDto, UpdateStatusDto } from './dto/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('registrations')
  listRegistrations(@Query() query: RegistrationsFilterDto) {
    return this.adminService.listRegistrations(query);
  }

  @Get('registrations/:type/:id')
  getRegistration(
    @Param('type') type: 'farmer' | 'supplier' | 'distributor' | 'lga-coordinator',
    @Param('id') id: string,
  ) {
    return this.adminService.getRegistration(type, id);
  }

  @Patch('registrations/:type/:id/status')
  updateStatus(
    @Param('type') type: 'farmer' | 'supplier' | 'distributor' | 'lga-coordinator',
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
  ) {
    return this.adminService.updateStatus(type, id, body);
  }
}
