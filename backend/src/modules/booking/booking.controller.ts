import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BOOKING_RESOURCE_SEGMENT } from './constants/booking-route';
import { BookingService } from './booking.service';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller(BOOKING_RESOURCE_SEGMENT)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('admin/list')
  findAllForAdmin() {
    return this.bookingService.findAllForAdmin();
  }

  @Patch('admin/:id/check-in')
  adminCheckIn(@Param('id') id: string) {
    return this.bookingService.adminCheckIn(id);
  }

  @Get()
  findByGuestEmail(@Query('email') email: string) {
    return this.bookingService.findByGuestEmail(email ?? '');
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('email') email: string) {
    return this.bookingService.findOne(id, email ?? '');
  }

  @Post(':id/payment')
  completePayment(
    @Param('id') id: string,
    @Body() dto: CompletePaymentDto,
  ) {
    return this.bookingService.completePayment(id, dto);
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }
}
