import {
  Injectable,
  UnauthorizedException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAuthService implements OnModuleInit {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Seed admin account on first run
  async onModuleInit() {
    const count = await this.prisma.adminAccount.count();
    if (count === 0) {
      const email = this.config.get('ADMIN_EMAIL', 'admin@barblink.com');
      const password = this.config.get('ADMIN_INITIAL_PASSWORD', 'admin123');
      const name = this.config.get('ADMIN_NAME', 'Platform Admin');

      const hash = await bcrypt.hash(password, 12);
      await this.prisma.adminAccount.create({
        data: { email, passwordHash: hash, name },
      });
      this.logger.warn(`Admin account created: ${email}`);
      this.logger.warn('IMPORTANT: Change the admin password on first login.');
    }
  }

  async login(email: string, password: string) {
    const admin = await this.prisma.adminAccount.findUnique({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.adminAccount.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Issue JWT with admin role — longer expiry for admin sessions
    const payload = { sub: admin.id, role: 'admin', name: admin.name };
    const accessToken = this.jwt.sign(payload, { expiresIn: '24h' });

    return {
      accessToken,
      refreshToken: accessToken, // admin uses same token as refresh for simplicity
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await this.prisma.adminAccount.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException('Admin not found');

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.adminAccount.update({
      where: { id: adminId },
      data: { passwordHash: hash },
    });

    return { message: 'Password changed' };
  }
}
