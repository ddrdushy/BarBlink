import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SocialController, AdminSocialController } from './social.controller';
import { StoriesController } from './stories.controller';
import { AdminAdsController, AdsController } from './ads.controller';
import { FaceTagsController } from './face-tags.controller';
import { SocialService } from './social.service';
import { StoriesService } from './stories.service';
import { AdsService } from './ads.service';
import { FaceTagsService } from './face-tags.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [
    SocialController,
    AdminSocialController,
    StoriesController,
    AdminAdsController,
    AdsController,
    FaceTagsController,
  ],
  providers: [SocialService, StoriesService, AdsService, FaceTagsService, JwtStrategy],
})
export class SocialModule {}
