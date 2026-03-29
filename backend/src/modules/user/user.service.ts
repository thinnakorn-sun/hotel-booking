import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForAdmin() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateStaffUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    return this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        role: dto.role,
        status: dto.status ?? 'ACTIVE',
      },
    });
  }

  async update(id: string, dto: UpdateStaffUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name != null ? { name: dto.name.trim() } : {}),
        ...(dto.role != null ? { role: dto.role } : {}),
        ...(dto.status != null ? { status: dto.status } : {}),
      },
    });
  }
}
