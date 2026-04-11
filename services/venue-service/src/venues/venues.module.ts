import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [VenuesController],
  providers: [VenuesService, JwtStrategy],
})
export class VenuesModule {}
