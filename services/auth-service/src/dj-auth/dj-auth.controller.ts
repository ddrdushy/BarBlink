import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { DjAuthService, DjRegisterDto } from './dj-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth/dj')
export class DjAuthController {
  constructor(private readonly djAuthService: DjAuthService) {}

  @Post('register')
  register(@Body() body: DjRegisterDto) {
    return this.djAuthService.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.djAuthService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const { userId } = req.user as { userId: string };
    return this.djAuthService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }
}
