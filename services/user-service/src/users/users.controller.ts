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

  // --- Follow system ---

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
  @Get('me/counts')
  getCounts(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getFollowCounts(userId);
  }

  // --- Going Tonight ---

  @UseGuards(JwtAuthGuard)
  @Post('me/going-tonight')
  setGoingTonight(@Req() req: Request, @Body('venueId') venueId: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.setGoingTonight(userId, venueId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/going-tonight')
  clearGoingTonight(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.clearGoingTonight(userId);
  }

  @Get('going-tonight')
  getGoingTonightUsers(@Query('country') country?: string) {
    return this.usersService.getGoingTonightUsers(country);
  }

  // --- Trusted Circle + Home Safe ---

  @UseGuards(JwtAuthGuard)
  @Get('me/trusted-circle')
  getTrustedCircle(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getTrustedCircle(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('trusted-circle/:id')
  addToTrustedCircle(@Req() req: Request, @Param('id') friendId: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.addToTrustedCircle(userId, friendId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('trusted-circle/:id')
  removeFromTrustedCircle(@Req() req: Request, @Param('id') friendId: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.removeFromTrustedCircle(userId, friendId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/home-safe')
  sendHomeSafe(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.sendHomeSafe(userId);
  }

  // --- QR Code Connect ---

  @UseGuards(JwtAuthGuard)
  @Get('me/qr')
  getQrCode(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getOrCreateQrCode(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('qr/connect')
  connectViaQr(@Req() req: Request, @Body('code') code: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.connectViaQr(code, userId);
  }

  // --- People You May Know ---

  @UseGuards(JwtAuthGuard)
  @Get('suggestions')
  getSuggestions(@Req() req: Request, @Query('country') country?: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getSuggestions(userId, country);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  searchUsers(@Req() req: Request, @Query('q') q: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.searchUsers(q || '', userId);
  }

  // --- Subscription ---

  @UseGuards(JwtAuthGuard)
  @Get('me/subscription')
  getSubscription(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.getSubscription(userId);
  }

  // --- Bar Buddy ---

  @UseGuards(JwtAuthGuard)
  @Post('me/bar-buddy')
  createBuddyRequest(
    @Req() req: Request,
    @Body() body: { area: string; message?: string; genres?: string[] },
  ) {
    const { userId } = req.user as { userId: string };
    return this.usersService.createBuddyRequest(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bar-buddy')
  getActiveBuddyRequests(@Query('area') area?: string) {
    return this.usersService.getActiveBuddyRequests(area);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/bar-buddy')
  cancelBuddyRequest(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.cancelBuddyRequest(userId);
  }

  // --- Parameterized routes (must be last to avoid swallowing static routes) ---

  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.usersService.getByUsername(username);
  }

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
  @Put('requests/:id')
  respondToRequest(@Req() req: Request, @Param('id') id: string, @Body('action') action: string) {
    const { userId } = req.user as { userId: string };
    return this.usersService.respondToRequest(userId, id, action);
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
  @Put('users/:id/subscription')
  updateSubscription(
    @Param('id') id: string,
    @Body() body: { plan: string; expiresAt?: string },
  ) {
    return this.usersService.updateSubscription(id, body.plan, body.expiresAt);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats() {
    return this.usersService.adminStats();
  }
}
