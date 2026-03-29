import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_SUITE_CATEGORY } from './constants/suite-category';
import { DEFAULT_SUITE_STATUS } from './constants/suite-status';
import { SUITE_NOT_FOUND_MESSAGE } from './constants/suite-errors';
import { CreateSuiteDto } from './dto/create-suite.dto';
import { SuiteResponseMapper } from './mappers/suite-response.mapper';
import { SuiteRepository } from './suite.repository';
import type { SuiteResponse } from './types/suite-response.type';

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

  async reconcileSuite(suiteId: string): Promise<void> {
    await this.suiteRepository.reconcileSuiteStatus(suiteId);
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
