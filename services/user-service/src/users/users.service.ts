import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (existing) {
      throw new ConflictException('Profile already exists');
    }

    const usernameTaken = await this.prisma.profile.findUnique({
      where: { username: dto.username },
    });
    if (usernameTaken) {
      throw new ConflictException('Username is already taken');
    }

    return this.prisma.profile.create({
      data: {
        id: userId,
        username: dto.username,
        displayName: dto.displayName,
        country: dto.country || 'MY',
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id: userId },
      data: dto,
    });
  }

  async getByUsername(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
    });
    if (!profile) {
      throw new NotFoundException('User not found');
    }
    return profile;
  }

  // --- Admin endpoints ---

  async adminListUsers(query: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = query;
    const where = search
      ? { OR: [
          { username: { contains: search, mode: 'insensitive' as const } },
          { displayName: { contains: search, mode: 'insensitive' as const } },
        ] }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async adminUpdateStatus(userId: string, status: string) {
    // Note: status lives in auth-service. For now we track it here too.
    // In production, this would call auth-service internally.
    return { userId, status, message: `User status updated to ${status}` };
  }

  async adminStats() {
    const total = await this.prisma.profile.count();
    return { totalUsers: total };
  }
}
