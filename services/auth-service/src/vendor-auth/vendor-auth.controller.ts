import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { VendorAuthService, VendorRegisterDto } from './vendor-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth/vendor')
export class VendorAuthController {
  constructor(private readonly vendorAuthService: VendorAuthService) {}

  @Post('register')
  register(@Body() body: VendorRegisterDto) {
    return this.vendorAuthService.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.vendorAuthService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const { userId } = req.user as { userId: string };
    return this.vendorAuthService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }
}
