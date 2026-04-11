import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { VenuesModule } from './venues/venues.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, VenuesModule],
})
export class AppModule {}
