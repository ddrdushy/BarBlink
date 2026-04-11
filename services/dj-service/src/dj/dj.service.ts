import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../prisma/generated';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDjDto } from './dto/create-dj.dto';
import { UpdateDjDto } from './dto/update-dj.dto';
import { ListDjQueryDto } from './dto/list-dj-query.dto';

@Injectable()
export class DjService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListDjQueryDto) {
    const { country, genre, page = 1, limit = 20 } = query;
    const where: Prisma.DjProfileWhereInput = { status: 'active' };
    if (country) where.country = country;
    if (genre) where.genreTags = { has: genre };

    const [items, total] = await Promise.all([
      this.prisma.djProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.djProfile.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const dj = await this.prisma.djProfile.findUnique({
      where: { id },
      include: { venueLinks: true },
    });
    if (!dj) throw new NotFoundException('DJ not found');
    return dj;
  }

  async create(dto: CreateDjDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return this.prisma.djProfile.create({
      data: { ...dto, slug } as any,
    });
  }

  async update(id: string, dto: UpdateDjDto) {
    const dj = await this.prisma.djProfile.findUnique({ where: { id } });
    if (!dj) throw new NotFoundException('DJ not found');
    return this.prisma.djProfile.update({ where: { id }, data: dto as any });
  }

  async adminStats() {
    const total = await this.prisma.djProfile.count();
    return { totalDjs: total };
  }
}
