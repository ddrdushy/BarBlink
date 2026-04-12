import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.settingsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus() {
    return this.settingsService.getIntegrationStatus();
  }

  @UseGuards(JwtAuthGuard)
  @Get('audit-log')
  getAuditLog() {
    return this.settingsService.getAuditLog();
  }

  @UseGuards(JwtAuthGuard)
  @Get('category/:category')
  getByCategory(@Param('category') category: string) {
    return this.settingsService.getByCategory(category);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':key/reveal')
  revealSetting(@Req() req: Request, @Param('key') key: string) {
    const user = req.user as { userId: string; name?: string } | undefined;
    return this.settingsService.revealSetting(
      key,
      user?.userId || 'unknown',
      user?.name,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  set(
    @Req() req: Request,
    @Body() body: { key: string; value: string; category: string; secret?: boolean },
  ) {
    const user = req.user as { userId: string; name?: string } | undefined;
    return this.settingsService.set({
      ...body,
      adminId: user?.userId,
      adminName: user?.name,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  setBulk(
    @Req() req: Request,
    @Body() body: { settings: Array<{ key: string; value: string; category: string; secret?: boolean }> },
  ) {
    const user = req.user as { userId: string; name?: string } | undefined;
    return this.settingsService.setBulk(
      body.settings.map((s) => ({ ...s, adminId: user?.userId, adminName: user?.name })),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }
}
