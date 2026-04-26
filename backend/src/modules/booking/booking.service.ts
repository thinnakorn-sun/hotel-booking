import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DEFAULT_SUITE_STATUS } from '../suite/constants/suite-status';
import { SuiteService } from '../suite/suite.service';
import { BookingRepository } from './booking.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { BookingResponseMapper } from './mappers/booking-response.mapper';
import type { BookingWithRelationsResponse } from './types/booking-response.type';

const MS_PER_DAY = 86_400_000;

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly suiteService: SuiteService,
    private readonly bookingResponseMapper: BookingResponseMapper,
  ) {}

  async create(dto: CreateBookingDto): Promise<BookingWithRelationsResponse> {
    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);
    if (checkOut <= checkIn) {
      throw new BadRequestException('checkOutDate must be after checkInDate');
    }
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / MS_PER_DAY,
    );
    if (nights < 1) {
      throw new BadRequestException('Minimum stay is one night');
    }

    const suite = await this.suiteService.findByIdRaw(dto.suiteId);
    if (!suite) {
      throw new NotFoundException('Suite not found');
    }
    if (suite.status !== DEFAULT_SUITE_STATUS) {
      throw new ConflictException('Suite is not available for booking');
    }

    const email = dto.guest.email.trim().toLowerCase();
    const guest = await this.bookingRepository.upsertGuest({
      email,
      firstName: dto.guest.firstName.trim(),
      lastName: dto.guest.lastName.trim(),
      phone: dto.guest.phone?.trim(),
    });

    const pricePerNight = Number(suite.pricePerNight);
    const totalAmount = nights * pricePerNight;

    const booking = await this.bookingRepository.createBookingReserved({
      guestId: guest.id,
      suiteId: suite.id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalAmount,
    });
    if (!booking) {
      throw new ConflictException('Suite is not available for booking');
    }

    return this.bookingResponseMapper.toResponse(booking);
  }

  async findByGuestEmail(
    email: string,
  ): Promise<BookingWithRelationsResponse[]> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('email is required');
    }
    const rows = await this.bookingRepository.findByGuestEmail(normalized);
    return this.bookingResponseMapper.toResponseList(rows);
  }

  async findOne(
    id: string,
    email: string,
  ): Promise<BookingWithRelationsResponse> {
    const normalized = email?.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('email query is required');
    }
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.guest.email.toLowerCase() !== normalized) {
      throw new ForbiddenException('Invalid credentials for this booking');
    }
    return this.bookingResponseMapper.toResponse(booking);
  }

  async findAllForAdmin(): Promise<BookingWithRelationsResponse[]> {
    const rows = await this.bookingRepository.findAllOrdered();
    return this.bookingResponseMapper.toResponseList(rows);
  }

  async adminCheckIn(id: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Only confirmed (paid) bookings can check in',
      );
    }
    if (booking.checkedInAt) {
      throw new ConflictException('Guest already checked in');
    }
    const updated = await this.bookingRepository.markCheckedIn(id);
    await this.suiteService.reconcileSuite(updated.suite.id);
    return this.bookingResponseMapper.toResponse(updated);
  }

  async completePayment(
    id: string,
    dto: CompletePaymentDto,
  ): Promise<BookingWithRelationsResponse> {
    const email = dto.guestEmail.trim().toLowerCase();
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.guest.email.toLowerCase() !== email) {
      throw new ForbiddenException('Invalid credentials for this booking');
    }
    if (booking.paymentStatus === 'PAID') {
      throw new ConflictException('This booking is already paid');
    }

    const updated = await this.bookingRepository.recordPayment(
      id,
      dto.paymentMethod,
      booking.totalAmount,
    );

    await this.suiteService.reconcileSuite(updated.suite.id);

    return this.bookingResponseMapper.toResponse(updated);
  }
}
