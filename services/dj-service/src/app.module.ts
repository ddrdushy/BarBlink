import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DjModule } from './dj/dj.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, DjModule],
})
export class AppModule {}
