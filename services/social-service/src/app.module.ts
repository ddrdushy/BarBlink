import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SocialModule } from './social/social.module';
import { UploadModule } from './upload/upload.module';
import { UploadController } from './upload/upload.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, SocialModule, UploadModule],
  controllers: [UploadController],
})
export class AppModule {}
