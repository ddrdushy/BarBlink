import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt, decrypt, hashForAudit } from '@barblink/shared-utils';

interface SettingInput {
  key: string;
  value: string;
  category: string;
  secret?: boolean;
  adminId?: string;
  adminName?: string;
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  private getEncryptionKey(): Buffer | null {
    const keyHex = process.env.SETTINGS_ENCRYPTION_KEY;
    if (!keyHex) return null;
    return Buffer.from(keyHex, 'hex');
  }

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
    if (!setting?.value) return null;

    // If the value is encrypted (secret + encryption key available), decrypt it
    if (setting.isSecret) {
      const encKey = this.getEncryptionKey();
      if (encKey && setting.value.includes(':')) {
        try {
          return decrypt(setting.value, encKey);
        } catch {
          // Value may not be encrypted yet (pre-migration), return as-is
          return setting.value;
        }
      }
    }
    return setting.value;
  }

  async set(input: SettingInput) {
    let valueToStore = input.value;
    const isSecret = input.secret ?? false;

    // Encrypt secret values when encryption key is available
    if (isSecret) {
      const encKey = this.getEncryptionKey();
      if (encKey) {
        valueToStore = encrypt(input.value, encKey);
      }
    }

    // Check if setting already exists (for audit action)
    const existing = await this.prisma.platformSetting.findUnique({
      where: { key: input.key },
    });
    const action = existing ? 'updated' : 'created';

    const result = await this.prisma.platformSetting.upsert({
      where: { key: input.key },
      create: {
        key: input.key,
        value: valueToStore,
        category: input.category,
        isSecret,
      },
      update: {
        value: valueToStore,
        category: input.category,
        isSecret,
      },
    });

    // Write audit log
    await this.writeAuditLog(input.key, action, input.adminId, input.adminName, existing?.value);

    return result;
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

  async revealSetting(key: string, adminId: string, adminName?: string) {
    const setting = await this.prisma.platformSetting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);

    let plainValue = setting.value;

    if (setting.isSecret) {
      const encKey = this.getEncryptionKey();
      if (encKey && setting.value.includes(':')) {
        try {
          plainValue = decrypt(setting.value, encKey);
        } catch {
          // Value may not be encrypted yet, return as-is
        }
      }
    }

    // Write audit log for the reveal action
    await this.writeAuditLog(key, 'revealed', adminId, adminName);

    return {
      key: setting.key,
      value: plainValue,
      category: setting.category,
      isSecret: setting.isSecret,
    };
  }

  async getAuditLog() {
    return this.prisma.settingsAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
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

  private async writeAuditLog(
    settingKey: string,
    action: string,
    adminId?: string,
    adminName?: string,
    oldValue?: string,
  ) {
    try {
      await this.prisma.settingsAuditLog.create({
        data: {
          settingKey,
          action,
          adminId: adminId || '00000000-0000-0000-0000-000000000000',
          adminName: adminName || null,
          oldValueHash: oldValue ? hashForAudit(oldValue) : null,
        },
      });
    } catch {
      /* silent - audit logging is non-critical */
    }
  }
}
