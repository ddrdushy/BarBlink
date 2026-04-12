import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto } from './dto/create-story.dto';

interface StoryGroup {
  userId: string;
  stories: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    venueId: string | null;
    createdAt: string;
    viewed: boolean;
  }[];
  storyCount: number;
  hasUnviewed: boolean;
}

@Injectable()
export class StoriesService {
  constructor(private prisma: PrismaService) {}

  async createStory(userId: string, dto: CreateStoryDto) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await this.prisma.story.create({
      data: {
        userId,
        mediaUrl: dto.mediaUrl,
        mediaType: dto.mediaType,
        venueId: dto.venueId,
        expiresAt,
      },
    });

    return story;
  }

  async getActiveStories(currentUserId: string): Promise<StoryGroup[]> {
    // Clean up expired stories first
    await this.deleteExpired();

    const stories = await this.prisma.story.findMany({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      include: {
        views: {
          where: { viewerId: currentUserId },
          select: { id: true },
        },
        _count: { select: { views: true } },
      },
    });

    // Group stories by userId
    const groupMap = new Map<string, StoryGroup>();

    for (const story of stories) {
      const viewed = story.views.length > 0;

      const storyItem = {
        id: story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        venueId: story.venueId,
        createdAt: story.createdAt.toISOString(),
        viewed,
      };

      const existing = groupMap.get(story.userId);
      if (existing) {
        existing.stories.push(storyItem);
        existing.storyCount += 1;
        if (!viewed) existing.hasUnviewed = true;
      } else {
        groupMap.set(story.userId, {
          userId: story.userId,
          stories: [storyItem],
          storyCount: 1,
          hasUnviewed: !viewed,
        });
      }
    }

    return Array.from(groupMap.values());
  }

  async viewStory(storyId: string, viewerId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });
    if (!story) throw new NotFoundException('Story not found');

    await this.prisma.storyView.upsert({
      where: { storyId_viewerId: { storyId, viewerId } },
      create: { storyId, viewerId },
      update: {},
    });

    return { message: 'Story viewed' };
  }

  async deleteExpired() {
    await this.prisma.story.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
