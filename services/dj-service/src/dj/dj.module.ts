import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { DjController } from './dj.controller';
import { DjService } from './dj.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [DjController],
  providers: [DjService, JwtStrategy],
})
export class DjModule {}
