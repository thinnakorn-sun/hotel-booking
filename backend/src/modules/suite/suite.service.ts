import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DEFAULT_SUITE_CATEGORY } from "./constants/suite-category";
import { DEFAULT_SUITE_STATUS } from "./constants/suite-status";
import { SUITE_NOT_FOUND_MESSAGE } from "./constants/suite-errors";
import { CreateSuiteDto } from "./dto/create-suite.dto";
import { FindAvailableSuitesDto } from "./dto/find-available-suites.dto";
import { SuiteResponseMapper } from "./mappers/suite-response.mapper";
import { SuiteRepository } from "./suite.repository";
import type { Suite } from "../../prisma-client";
import type { SuiteResponse } from "./types/suite-response.type";

@Injectable()
export class SuiteService {
  constructor(
    private readonly suiteRepository: SuiteRepository,
    private readonly suiteResponseMapper: SuiteResponseMapper,
  ) {}

  async findAll(): Promise<SuiteResponse[]> {
    await this.suiteRepository.reconcileAllSuiteStatuses();
    const rows = await this.suiteRepository.findAll();
    return this.suiteResponseMapper.toResponseList(rows);
  }

  async findAvailable(dto: FindAvailableSuitesDto): Promise<SuiteResponse[]> {
    const checkInDate = new Date(dto.checkInDate);
    const checkOutDate = new Date(dto.checkOutDate);
    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      throw new BadRequestException("Invalid check-in or check-out date");
    }
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException(
        "Check-out date must be after check-in date",
      );
    }
    const rows = await this.suiteRepository.findAvailableInRange(
      checkInDate,
      checkOutDate,
      dto.category?.toUpperCase(),
    );
    return this.suiteResponseMapper.toResponseList(rows);
  }

  async findOne(id: string): Promise<SuiteResponse> {
    await this.reconcileSuite(id);
    const row = await this.suiteRepository.findById(id);
    if (!row) {
      throw new NotFoundException(SUITE_NOT_FOUND_MESSAGE);
    }
    return this.suiteResponseMapper.toResponse(row);
  }

  async reconcileSuite(suiteId: string): Promise<void> {
    await this.suiteRepository.reconcileSuiteStatus(suiteId);
  }

  async reconcileAllSuites(): Promise<void> {
    await this.suiteRepository.reconcileAllSuiteStatuses();
  }

  async findByIdRaw(id: string): Promise<Suite | null> {
    return this.suiteRepository.findById(id);
  }

  async create(dto: CreateSuiteDto): Promise<SuiteResponse> {
    const created = await this.suiteRepository.create({
      name: dto.name,
      roomNumber: dto.roomNumber,
      description: dto.description,
      pricePerNight: dto.pricePerNight,
      status: dto.status ?? DEFAULT_SUITE_STATUS,
      category: dto.category ?? DEFAULT_SUITE_CATEGORY,
      imageUrl: dto.imageUrl ?? undefined,
    });
    return this.suiteResponseMapper.toResponse(created);
  }

  async updateStatus(id: string, status: string): Promise<SuiteResponse> {
    const existing = await this.suiteRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(SUITE_NOT_FOUND_MESSAGE);
    }
    const updated = await this.suiteRepository.update(id, { status });
    return this.suiteResponseMapper.toResponse(updated);
  }
}
