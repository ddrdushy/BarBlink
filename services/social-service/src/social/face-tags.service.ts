import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaceTagsService {
  constructor(private prisma: PrismaService) {}

  async createFaceTag(postId: string, taggedBy: string, userId: string, x: number, y: number) {
    // Verify post exists
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || !post.isActive) throw new NotFoundException('Post not found');

    return this.prisma.faceTag.create({
      data: { postId, taggedBy, userId, x, y },
    });
  }

  async getFaceTags(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.faceTag.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async confirmFaceTag(faceTagId: string, userId: string) {
    const tag = await this.prisma.faceTag.findUnique({ where: { id: faceTagId } });
    if (!tag) throw new NotFoundException('Face tag not found');

    // Only the tagged user can confirm
    if (tag.userId !== userId) {
      throw new ForbiddenException('Only the tagged user can confirm');
    }

    return this.prisma.faceTag.update({
      where: { id: faceTagId },
      data: { confirmed: true },
    });
  }
}
