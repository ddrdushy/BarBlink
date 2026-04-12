import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { WaitlistPublicController, WaitlistAdminController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [WaitlistPublicController, WaitlistAdminController],
  providers: [WaitlistService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
