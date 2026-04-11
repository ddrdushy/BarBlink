import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { CheckinsController } from './checkins.controller';
import { CheckinsService } from './checkins.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [CheckinsController],
  providers: [CheckinsService, JwtStrategy],
})
export class CheckinsModule {}
