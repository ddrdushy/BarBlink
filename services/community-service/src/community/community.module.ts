import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { CommunityController, AdminCommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [CommunityController, AdminCommunityController],
  providers: [CommunityService, JwtStrategy],
})
export class CommunityModule {}
