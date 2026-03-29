import { Module } from '@nestjs/common';
import { SuiteModule } from '../suite/suite.module';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';
import { BookingResponseMapper } from './mappers/booking-response.mapper';

@Module({
  imports: [SuiteModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, BookingResponseMapper],
})
export class BookingModule {}
