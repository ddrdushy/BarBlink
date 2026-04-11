import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { CheckinsController, AdminCheckinsController } from './checkins.controller';
import { CheckinsService } from './checkins.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [CheckinsController, AdminCheckinsController],
  providers: [CheckinsService, JwtStrategy],
})
export class CheckinsModule {}
