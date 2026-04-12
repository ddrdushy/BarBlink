import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export interface VendorRegisterDto {
  email: string;
  password: string;
  businessName: string;
  contactName: string;
  phone: string;
  businessType: string;
  businessAddress?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  adminMessage?: string;
}

@Injectable()
export class VendorAuthService {
  private readonly logger = new Logger(VendorAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: VendorRegisterDto) {
    const existing = await this.prisma.vendorAccount.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    await this.prisma.vendorAccount.create({
      data: {
        email: dto.email,
        passwordHash,
        businessName: dto.businessName,
        contactName: dto.contactName,
        phone: dto.phone,
        businessType: dto.businessType,
        businessAddress: dto.businessAddress,
        instagramUrl: dto.instagramUrl,
        websiteUrl: dto.websiteUrl,
        adminMessage: dto.adminMessage,
        status: 'pending',
      },
    });

    this.logger.log(`Vendor application submitted: ${dto.email}`);

    return {
      message:
        'Application submitted successfully. You will be notified once reviewed.',
    };
  }

  async login(email: string, password: string) {
    const vendor = await this.prisma.vendorAccount.findUnique({
      where: { email },
    });
    if (!vendor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, vendor.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    switch (vendor.status) {
      case 'pending':
        throw new ForbiddenException(
          'Your application is still under review.',
        );
      case 'rejected':
        throw new ForbiddenException(
          `Your application was rejected: ${vendor.rejectionReason || 'No reason provided'}`,
        );
      case 'suspended':
        throw new ForbiddenException('Your account has been suspended.');
      case 'approved':
        break;
      default:
        throw new ForbiddenException('Account status unknown.');
    }

    const payload = {
      sub: vendor.id,
      role: 'vendor',
      venueId: vendor.venueId,
    };
    const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });

    return {
      accessToken,
      vendor: {
        id: vendor.id,
        email: vendor.email,
        businessName: vendor.businessName,
        venueId: vendor.venueId,
      },
    };
  }

  async changePassword(
    vendorId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const vendor = await this.prisma.vendorAccount.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw new UnauthorizedException('Vendor not found');
    }

    const valid = await bcrypt.compare(currentPassword, vendor.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.vendorAccount.update({
      where: { id: vendorId },
      data: { passwordHash: hash },
    });

    return { message: 'Password changed' };
  }
}
