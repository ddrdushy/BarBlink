import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { SettingsModule } from './settings/settings.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { VendorAuthModule } from './vendor-auth/vendor-auth.module';
import { DjAuthModule } from './dj-auth/dj-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MailModule,
    SettingsModule,
    AdminAuthModule,
    VendorAuthModule,
    DjAuthModule,
  ],
})
export class AppModule {}
