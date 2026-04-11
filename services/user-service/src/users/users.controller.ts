import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('me')
  create(@Req() req: Request, @Body() dto: CreateProfileDto) {
    const { userId } = req.user as { userId: string };
    return this.usersService.createProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  update(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const { userId } = req.user as { userId: string };
    return this.usersService.updateProfile(userId, dto);
  }

  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.usersService.getByUsername(username);
  }
}
