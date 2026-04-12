import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SocialController, AdminSocialController } from './social.controller';
import { StoriesController } from './stories.controller';
import { SocialService } from './social.service';
import { StoriesService } from './stories.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [SocialController, AdminSocialController, StoriesController],
  providers: [SocialService, StoriesService, JwtStrategy],
})
export class SocialModule {}
