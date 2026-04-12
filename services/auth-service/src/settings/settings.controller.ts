import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  @Get('category/:category')
  getByCategory(@Param('category') category: string) {
    return this.settingsService.getByCategory(category);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  set(@Body() body: { key: string; value: string; category: string; secret?: boolean }) {
    return this.settingsService.set(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  setBulk(@Body() body: { settings: Array<{ key: string; value: string; category: string; secret?: boolean }> }) {
    return this.settingsService.setBulk(body.settings);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }
}
