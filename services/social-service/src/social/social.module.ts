import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [SocialController],
  providers: [SocialService, JwtStrategy],
})
export class SocialModule {}
