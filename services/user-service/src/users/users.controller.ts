import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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

  // --- Follow system ---

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  follow(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.sendFollowRequest(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  unfollow(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.unfollow(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/followers')
  getFollowers(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getFollowers(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/following')
  getFollowing(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getFollowing(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/requests')
  getRequests(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getPendingRequests(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('requests/:id')
  respondToRequest(@Req() req: Request, @Param('id') id: string, @Body('action') action: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.respondToRequest(userId, id, action);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/counts')
  getCounts(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getFollowCounts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  searchUsers(@Req() req: Request, @Query('q') q: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.searchUsers(q || '', userId);
  }
}

@Controller('admin')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('users')
  list(@Query('search') search?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.adminListUsers({
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.adminUpdateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats() {
    return this.usersService.adminStats();
  }
}
