import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async listConversations(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            members: true,
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      id: m.conversation.id,
      type: m.conversation.type,
      name: m.conversation.name,
      memberCount: m.conversation.members.length,
      lastMessage: m.conversation.messages[0] || null,
      createdAt: m.conversation.createdAt.toISOString(),
    }));
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    const allMemberIds = Array.from(new Set([userId, ...dto.memberIds]));

    const conversation = await this.prisma.conversation.create({
      data: {
        type: dto.type,
        name: dto.name || null,
        members: {
          create: allMemberIds.map((id) => ({ userId: id })),
        },
      },
      include: { members: true },
    });

    return conversation;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    query: { page: number; limit: number },
  ) {
    const { page, limit } = query;

    // Verify user is a member
    const membership = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    const [items, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
    // Verify user is a member
    const membership = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        body: dto.body,
      },
    });
  }

  async getUserConversations(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    return memberships.map((m) => m.conversationId);
  }

  async getMessage(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async upsertReaction(messageId: string, userId: string, emoji: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');

    return this.prisma.messageReaction.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId, emoji },
      update: { emoji },
    });
  }

  async getReactions(messageId: string) {
    return this.prisma.messageReaction.findMany({
      where: { messageId },
    });
  }

  // --- Admin endpoints ---

  async adminStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalConversations, messagesToday] = await Promise.all([
      this.prisma.conversation.count(),
      this.prisma.message.count({ where: { createdAt: { gte: today } } }),
    ]);

    return { totalConversations, messagesToday };
  }
}
