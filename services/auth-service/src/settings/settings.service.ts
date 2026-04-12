import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SettingInput {
  key: string;
  value: string;
  category: string;
  secret?: boolean;
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.platformSetting.findMany({
      orderBy: { category: 'asc' },
    });
    // Mask secret values
    return settings.map((s) => ({
      ...s,
      value: s.isSecret ? this.maskValue(s.value) : s.value,
    }));
  }

  async getByCategory(category: string) {
    const settings = await this.prisma.platformSetting.findMany({
      where: { category },
    });
    return settings.map((s) => ({
      ...s,
      value: s.isSecret ? this.maskValue(s.value) : s.value,
    }));
  }

  async getRawValue(key: string): Promise<string | null> {
    const setting = await this.prisma.platformSetting.findUnique({ where: { key } });
    return setting?.value || null;
  }

  async set(input: SettingInput) {
    return this.prisma.platformSetting.upsert({
      where: { key: input.key },
      create: {
        key: input.key,
        value: input.value,
        category: input.category,
        isSecret: input.secret ?? false,
      },
      update: {
        value: input.value,
        category: input.category,
        isSecret: input.secret ?? false,
      },
    });
  }

  async setBulk(settings: SettingInput[]) {
    const results = [];
    for (const s of settings) {
      results.push(await this.set(s));
    }
    return { updated: results.length };
  }

  async delete(key: string) {
    await this.prisma.platformSetting.deleteMany({ where: { key } });
    return { message: `Setting ${key} deleted` };
  }

  async getIntegrationStatus() {
    const settings = await this.prisma.platformSetting.findMany();
    const has = (key: string) => settings.some((s) => s.key === key && s.value);

    return {
      mailgun: {
        configured: has('mailgun_api_key') && has('mailgun_domain'),
        fields: ['mailgun_api_key', 'mailgun_domain', 'mailgun_from'],
      },
      firebase: {
        configured: has('fcm_project_id') && has('fcm_client_email') && has('fcm_private_key'),
        fields: ['fcm_project_id', 'fcm_client_email', 'fcm_private_key'],
      },
      minio: {
        configured: has('minio_endpoint') && has('minio_access_key'),
        fields: ['minio_endpoint', 'minio_port', 'minio_access_key', 'minio_secret_key', 'minio_bucket'],
      },
      cloudflare: {
        configured: has('cloudflare_api_token'),
        fields: ['cloudflare_api_token', 'cloudflare_zone_id'],
      },
      scraper: {
        configured: true, // Scraper uses Playwright, no external API key needed
        fields: ['scraper_interval_hours', 'scraper_max_retries'],
      },
    };
  }

  private maskValue(value: string): string {
    if (value.length <= 8) return '••••••••';
    return value.slice(0, 4) + '••••' + value.slice(-4);
  }
}
