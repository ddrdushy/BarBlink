import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CheckinsModule } from './checkins/checkins.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, CheckinsModule],
})
export class AppModule {}
