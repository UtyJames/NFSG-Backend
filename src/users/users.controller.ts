import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminUser } from '@prisma/client';

@ApiTags('Admin Users')
@ApiBearerAuth('JWT-auth')
@Controller('admin/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all admin users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new admin user' })
  create(
    @Body() body: CreateUserDto,
    @CurrentUser() user: Partial<AdminUser>,
  ) {
    return this.usersService.create(body, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin user by ID' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() user: Partial<AdminUser>,
  ) {
    return this.usersService.update(id, body, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin user by ID' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: Partial<AdminUser>,
  ) {
    return this.usersService.remove(id, user);
  }
}

