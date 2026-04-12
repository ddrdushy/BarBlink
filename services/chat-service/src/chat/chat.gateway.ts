import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ChatService } from './chat.service';

interface AuthPayload {
  sub: string;
  phone: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as Record<string, string>)?.token ||
        (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const secret = this.configService.getOrThrow<string>('JWT_SECRET');
      const payload = jwt.verify(token, secret) as AuthPayload;
      const userId = payload.sub;

      this.connectedUsers.set(client.id, userId);

      // Join all conversation rooms this user belongs to
      const conversationIds = await this.chatService.getUserConversations(userId);
      for (const convId of conversationIds) {
        client.join(`conversation:${convId}`);
      }
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('message.send')
  async handleMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; body: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    try {
      const message = await this.chatService.sendMessage(userId, data.conversationId, {
        body: data.body,
      });

      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('message.new', message);

      return message;
    } catch {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('message.react')
  async handleMessageReact(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    try {
      const reaction = await this.chatService.upsertReaction(
        data.messageId,
        userId,
        data.emoji,
      );

      // Get the message to find which conversation room to broadcast to
      const message = await this.chatService.getMessage(data.messageId);

      this.server
        .to(`conversation:${message.conversationId}`)
        .emit('message.reaction', {
          messageId: data.messageId,
          userId,
          emoji: data.emoji,
          reaction,
        });

      return reaction;
    } catch {
      client.emit('error', { message: 'Failed to react' });
    }
  }

  @SubscribeMessage('typing.start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    client.to(`conversation:${data.conversationId}`).emit('conversation.typing', {
      conversationId: data.conversationId,
      userId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing.stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    client.to(`conversation:${data.conversationId}`).emit('conversation.typing', {
      conversationId: data.conversationId,
      userId,
      isTyping: false,
    });
  }
}
