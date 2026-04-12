import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export interface DjRegisterDto {
  email: string;
  password: string;
  stageName: string;
  djType: string;
  genres?: string[];
  bio?: string;
  instagramUrl?: string;
  phone?: string;
  claimType: string;
  claimedProfileId?: string;
}

@Injectable()
export class DjAuthService {
  private readonly logger = new Logger(DjAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: DjRegisterDto) {
    const existing = await this.prisma.djAccount.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // If claiming an existing profile, verify the claimedProfileId is provided
    if (dto.claimType === 'claim') {
      if (!dto.claimedProfileId) {
        throw new BadRequestException(
          'claimedProfileId is required when claimType is "claim"',
        );
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    await this.prisma.djAccount.create({
      data: {
        email: dto.email,
        passwordHash,
        stageName: dto.stageName,
        djType: dto.djType,
        genres: dto.genres || [],
        bio: dto.bio,
        instagramUrl: dto.instagramUrl,
        phone: dto.phone,
        claimType: dto.claimType,
        claimedProfileId: dto.claimedProfileId,
        status: 'pending',
      },
    });

    this.logger.log(`DJ application submitted: ${dto.email}`);

    return {
      message:
        'Application submitted successfully. You will be notified once reviewed.',
    };
  }

  async login(email: string, password: string) {
    const dj = await this.prisma.djAccount.findUnique({
      where: { email },
    });
    if (!dj) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, dj.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    switch (dj.status) {
      case 'pending':
        throw new ForbiddenException(
          'Your application is still under review.',
        );
      case 'rejected':
        throw new ForbiddenException(
          `Your application was rejected: ${dj.rejectionReason || 'No reason provided'}`,
        );
      case 'suspended':
        throw new ForbiddenException('Your account has been suspended.');
      case 'approved':
        break;
      default:
        throw new ForbiddenException('Account status unknown.');
    }

    const payload = {
      sub: dj.id,
      role: 'dj',
      djProfileId: dj.djProfileId,
    };
    const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });

    return {
      accessToken,
      dj: {
        id: dj.id,
        email: dj.email,
        stageName: dj.stageName,
        djProfileId: dj.djProfileId,
      },
    };
  }

  async changePassword(
    djId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const dj = await this.prisma.djAccount.findUnique({
      where: { id: djId },
    });
    if (!dj) {
      throw new UnauthorizedException('DJ not found');
    }

    const valid = await bcrypt.compare(currentPassword, dj.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.djAccount.update({
      where: { id: djId },
      data: { passwordHash: hash },
    });

    return { message: 'Password changed' };
  }
}
