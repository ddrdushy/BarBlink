import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SocialModule } from './social/social.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, SocialModule],
})
export class AppModule {}
