import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController, AdminNotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PassportModule, ConfigModule, PushModule],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [NotificationsService, JwtStrategy],
})
export class NotificationsModule {}
