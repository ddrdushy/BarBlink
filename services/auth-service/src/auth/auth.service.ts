import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    // Validate 18+
    const dob = new Date(dto.dateOfBirth);
    if (!this.isAtLeast18(dob)) {
      throw new BadRequestException('You must be at least 18 years old');
    }

    // Check if phone already exists
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        dateOfBirth: dob,
      },
    });

    // Auto-send OTP
    await this.generateAndSendOtp(user.phone, user.email);

    return {
      userId: user.id,
      message: 'OTP sent to your email',
    };
  }

  async sendOtp(dto: SendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (!user) {
      throw new BadRequestException('Phone number not registered');
    }

    // Rate limit: max 3 OTPs per phone in last 10 minutes
    const recentCount = await this.prisma.otpCode.count({
      where: {
        phone: dto.phone,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });
    if (recentCount >= 3) {
      throw new BadRequestException(
        'Too many OTP requests. Try again in a few minutes.',
      );
    }

    await this.generateAndSendOtp(user.phone, user.email);

    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    // Dev bypass: test account always accepts 123456
    const isDev = process.env.NODE_ENV !== 'production';
    const isTestAccount = dto.phone === '+60000000000' && dto.code === '123456';

    if (!(isDev && isTestAccount)) {
      // Find valid OTP
      const otp = await this.prisma.otpCode.findFirst({
        where: {
          phone: dto.phone,
          code: dto.code,
          used: false,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otp) {
        throw new BadRequestException('Invalid or expired OTP code');
      }

      // Mark OTP as used
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { used: true },
      });
    }

    // Mark phone as verified
    const user = await this.prisma.user.update({
      where: { phone: dto.phone },
      data: { phoneVerified: true },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.phone);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        phoneVerified: user.phoneVerified,
        dateOfBirth: user.dateOfBirth.toISOString().split('T')[0],
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async refresh(dto: RefreshDto) {
    // Find all non-expired refresh tokens
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { expiresAt: { gte: new Date() } },
    });

    // Find the one that matches
    let matchedToken: (typeof storedTokens)[0] | null = null;
    for (const stored of storedTokens) {
      const isMatch = await bcrypt.compare(dto.refreshToken, stored.tokenHash);
      if (isMatch) {
        matchedToken = stored;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Delete old token (rotation)
    await this.prisma.refreshToken.delete({
      where: { id: matchedToken.id },
    });

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: matchedToken.userId },
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Account not active');
    }

    // Issue new pair
    const tokens = await this.generateTokens(user.id, user.phone);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string, refreshToken: string) {
    // Find and delete the matching refresh token
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { userId, expiresAt: { gte: new Date() } },
    });

    for (const stored of storedTokens) {
      const isMatch = await bcrypt.compare(refreshToken, stored.tokenHash);
      if (isMatch) {
        await this.prisma.refreshToken.delete({
          where: { id: stored.id },
        });
        break;
      }
    }

    return { message: 'Logged out' };
  }

  // --- Private helpers ---

  private isAtLeast18(dob: Date): boolean {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  }

  private async generateAndSendOtp(phone: string, email: string) {
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpCode.create({
      data: { phone, email, code, expiresAt },
    });

    await this.mail.sendOtp(email, code);

    this.logger.log(`OTP generated for ${phone}`);
  }

  private async generateTokens(userId: string, phone: string) {
    const payload = { sub: userId, phone };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });

    // Generate a random refresh token string
    const refreshToken = require('crypto').randomBytes(40).toString('hex');

    // Hash and store
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
