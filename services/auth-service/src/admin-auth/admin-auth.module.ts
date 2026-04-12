import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { PromotersController } from './promoters.controller';
import { PromotersService } from './promoters.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRY', '15m') },
      }),
    }),
  ],
  controllers: [AdminAuthController, ApplicationsController, PromotersController],
  providers: [AdminAuthService, ApplicationsService, PromotersService],
})
export class AdminAuthModule {}
