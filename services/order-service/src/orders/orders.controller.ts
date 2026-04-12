import {
  Controller, Get, Post, Put,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const { userId } = req.user as { userId: string };
    return this.ordersService.createOrder(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserOrders(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.ordersService.getUserOrders(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }
}
