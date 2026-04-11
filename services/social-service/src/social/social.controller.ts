import {
  Controller, Get, Post, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  getFeed(@Req() req: Request, @Query() query: FeedQueryDto) {
    const { userId } = req.user as { userId: string };
    return this.socialService.getFeed(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  createPost(@Req() req: Request, @Body() dto: CreatePostDto) {
    const { userId } = req.user as { userId: string };
    return this.socialService.createPost(userId, dto);
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string) {
    return this.socialService.getPost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  deletePost(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.socialService.deletePost(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/like')
  like(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.socialService.likePost(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id/like')
  unlike(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.socialService.unlikePost(userId, id);
  }

  @Get('posts/:id/comments')
  getComments(@Param('id') id: string) {
    return this.socialService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  addComment(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.socialService.addComment(userId, id, dto);
  }
}

@Controller('admin')
export class AdminSocialController {
  constructor(private readonly socialService: SocialService) {}

  @UseGuards(JwtAuthGuard)
  @Get('posts')
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.socialService.adminListPosts({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    return this.socialService.adminDeletePost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats() {
    return this.socialService.adminStats();
  }
}
