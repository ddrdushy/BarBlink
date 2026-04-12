import {
  Controller, Get, Post,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getActiveStories(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.storiesService.getActiveStories(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createStory(@Req() req: Request, @Body() dto: CreateStoryDto) {
    const { userId } = req.user as { userId: string };
    return this.storiesService.createStory(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/view')
  viewStory(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.storiesService.viewStory(id, userId);
  }
}
