import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [EventsController],
  providers: [EventsService, JwtStrategy],
})
export class EventsModule {}
