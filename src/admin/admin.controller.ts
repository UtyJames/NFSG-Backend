import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RegistrationsFilterDto, UpdateStatusDto } from './dto/admin.dto';

@ApiTags('Admin Management')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('registrations')
  @ApiOperation({ summary: 'List and filter all registrations (farmers, suppliers, distributors, lga-coordinators)' })
  listRegistrations(@Query() query: RegistrationsFilterDto) {
    return this.adminService.listRegistrations(query);
  }

  @Get('registrations/:type/:id')
  @ApiOperation({ summary: 'Get specific registration details by type and ID' })
  getRegistration(
    @Param('type') type: 'farmer' | 'supplier' | 'distributor' | 'lga-coordinator',
    @Param('id') id: string,
  ) {
    return this.adminService.getRegistration(type, id);
  }

  @Patch('registrations/:type/:id')
  @ApiOperation({ summary: 'Update registration details (Super Admin)' })
  updateRegistration(
    @Param('type') type: 'farmer' | 'supplier' | 'distributor' | 'lga-coordinator',
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    return this.adminService.updateRegistration(type, id, body);
  }

  @Patch('registrations/:type/:id/status')
  @ApiOperation({ summary: 'Update registration status (approve, reject, flag)' })
  updateStatus(
    @Param('type') type: 'farmer' | 'supplier' | 'distributor' | 'lga-coordinator',
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
  ) {
    return this.adminService.updateStatus(type, id, body);
  }
}
