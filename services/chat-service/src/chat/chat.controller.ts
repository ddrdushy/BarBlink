import {
  Controller, Get, Post,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  listConversations(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.chatService.listConversations(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations')
  createConversation(@Req() req: Request, @Body() dto: CreateConversationDto) {
    const { userId } = req.user as { userId: string };
    return this.chatService.createConversation(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id/messages')
  getMessages(
    @Req() req: Request,
    @Param('id') conversationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { userId } = req.user as { userId: string };
    return this.chatService.getMessages(userId, conversationId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations/:id/messages')
  sendMessage(
    @Req() req: Request,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.chatService.sendMessage(userId, conversationId, dto);
  }
}

@Controller('admin')
export class AdminChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('chat/stats')
  stats() {
    return this.chatService.adminStats();
  }
}
