import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('notifications')
  getNotifications(@Query('since') since?: string) {
    return this.adminService.getNotifications(since);
  }

  @Get('arrivals')
  getArrivals(@Query('date') date?: string) {
    const d = date?.trim() || new Date().toISOString().slice(0, 10);
    return this.adminService.getArrivalsForDate(d);
  }
}
