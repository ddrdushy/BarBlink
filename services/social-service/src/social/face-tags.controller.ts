import {
  Controller, Get, Post, Put,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { FaceTagsService } from './face-tags.service';
import { CreateFaceTagDto } from './dto/create-face-tag.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller()
export class FaceTagsController {
  constructor(private readonly faceTagsService: FaceTagsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/face-tags')
  create(
    @Req() req: Request,
    @Param('id') postId: string,
    @Body() dto: CreateFaceTagDto,
  ) {
    const { userId } = req.user as { userId: string };
    return this.faceTagsService.createFaceTag(postId, userId, dto.userId, dto.x, dto.y);
  }

  @Get('posts/:id/face-tags')
  list(@Param('id') postId: string) {
    return this.faceTagsService.getFaceTags(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('face-tags/:id/confirm')
  confirm(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.faceTagsService.confirmFaceTag(id, userId);
  }
}
