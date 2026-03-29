import { Injectable } from '@nestjs/common';
import { Prisma, Suite } from '../../prisma-client';
import { IBaseRepository } from '../../common/interfaces/base-repository.interface';
import { PrismaService } from '../../database/prisma.service';
import type { SuiteStatus } from './constants/suite-status';

@Injectable()
export class SuiteRepository
  implements IBaseRepository<Suite, Prisma.SuiteCreateInput, Prisma.SuiteUpdateInput>
{
  constructor(private readonly prisma: PrismaService) {}

  async reconcileSuiteStatus(suiteId: string): Promise<void> {
    const suite = await this.prisma.suite.findUnique({ where: { id: suiteId } });
    if (!suite || suite.status === 'MAINTENANCE') {
      return;
    }

    const now = new Date();
    const bookings = await this.prisma.booking.findMany({
      where: {
        suiteId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        checkOutDate: { gt: now },
      },
    });

    let next: SuiteStatus = 'AVAILABLE';
    if (bookings.length > 0) {
      const occupied = bookings.some(
        (b) =>
          b.status === 'CONFIRMED' &&
          b.checkInDate <= now &&
          b.checkOutDate > now,
      );
      next = occupied ? 'OCCUPIED' : 'RESERVED';
    }

    if (suite.status !== next) {
      await this.prisma.suite.update({
        where: { id: suiteId },
        data: { status: next },
      });
    }
  }

  async reconcileAllSuiteStatuses(): Promise<void> {
    const suites = await this.prisma.suite.findMany({ select: { id: true } });
    await Promise.all(
      suites.map((s) => this.reconcileSuiteStatus(s.id)),
    );
  }

  findAll(): Promise<Suite[]> {
    return this.prisma.suite.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string): Promise<Suite | null> {
    return this.prisma.suite.findUnique({ where: { id } });
  }

  create(data: Prisma.SuiteCreateInput): Promise<Suite> {
    return this.prisma.suite.create({ data });
  }

  update(id: string, data: Prisma.SuiteUpdateInput): Promise<Suite> {
    return this.prisma.suite.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.suite.delete({ where: { id } });
  }
}
