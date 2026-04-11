import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ChatController, AdminChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  controllers: [ChatController, AdminChatController],
  providers: [ChatService, JwtStrategy],
})
export class ChatModule {}
