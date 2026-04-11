import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DiscoveryModule } from './discovery/discovery.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, DiscoveryModule],
})
export class AppModule {}
