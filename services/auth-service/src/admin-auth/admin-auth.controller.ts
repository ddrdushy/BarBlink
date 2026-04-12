import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.adminAuthService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const { userId } = req.user as { userId: string };
    return this.adminAuthService.changePassword(userId, body.currentPassword, body.newPassword);
  }
}
