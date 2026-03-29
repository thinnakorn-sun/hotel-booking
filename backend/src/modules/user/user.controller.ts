import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('admin/list')
  findAllForAdmin() {
    return this.userService.findAllForAdmin();
  }

  @Post('admin')
  create(@Body() dto: CreateStaffUserDto) {
    return this.userService.create(dto);
  }

  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffUserDto) {
    return this.userService.update(id, dto);
  }
}
