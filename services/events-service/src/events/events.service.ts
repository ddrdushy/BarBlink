import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '../prisma/generated';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListEventsQueryDto) {
    const { country, date, venueId, page = 1, limit = 20 } = query;
    const where: Prisma.EventWhereInput = {};
    if (country) where.country = country;
    if (venueId) where.venueId = venueId;
    if (date) where.date = new Date(date);

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'asc' },
        include: { _count: { select: { rsvps: true } } },
      }),
      this.prisma.event.count({ where }),
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
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { rsvps: true } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async rsvp(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    try {
      const rsvp = await this.prisma.rsvp.create({
        data: { eventId, userId },
      });
      return rsvp;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Already RSVP\'d to this event');
      }
      throw e;
    }
  }

  async cancelRsvp(eventId: string, userId: string) {
    const rsvp = await this.prisma.rsvp.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!rsvp) throw new NotFoundException('RSVP not found');

    await this.prisma.rsvp.delete({
      where: { eventId_userId: { eventId, userId } },
    });
    return { message: 'RSVP cancelled' };
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        coverCharge: dto.coverCharge != null ? new Prisma.Decimal(dto.coverCharge) : undefined,
      } as any,
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    if (dto.coverCharge != null) data.coverCharge = new Prisma.Decimal(dto.coverCharge);

    return this.prisma.event.update({ where: { id }, data });
  }

  async adminStats() {
    const [total, upcoming] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.event.count({ where: { status: 'upcoming' } }),
    ]);
    return { totalEvents: total, upcomingEvents: upcoming };
  }
}
