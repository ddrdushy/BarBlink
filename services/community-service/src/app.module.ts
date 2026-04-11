import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, CommunityModule],
})
export class AppModule {}
