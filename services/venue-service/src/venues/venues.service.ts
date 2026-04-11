import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../prisma/generated';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { ListVenuesQueryDto } from './dto/list-venues-query.dto';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListVenuesQueryDto) {
    const { country, area, category, page = 1, limit = 20 } = query;
    const where: Prisma.VenueWhereInput = { status: 'active' };
    if (country) where.country = country;
    if (area) where.area = area;
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      this.prisma.venue.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.venue.count({ where }),
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
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: { photos: { orderBy: { displayOrder: 'asc' } }, hours: true },
    });
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async getPhotos(venueId: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Venue not found');
    return this.prisma.venuePhoto.findMany({
      where: { venueId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async create(dto: CreateVenueDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return this.prisma.venue.create({
      data: { ...dto, slug },
    });
  }

  async update(id: string, dto: UpdateVenueDto) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');
    return this.prisma.venue.update({ where: { id }, data: dto });
  }

  async adminStats() {
    const total = await this.prisma.venue.count({ where: { status: 'active' } });
    return { totalVenues: total };
  }
}
