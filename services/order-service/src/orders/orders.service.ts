import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '../prisma/generated/runtime/library';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    userId: string,
    data: { venueId: string; items: { name: string; quantity: number; price: number }[]; notes?: string },
  ) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        userId,
        venueId: data.venueId,
        totalAmount: new Decimal(totalAmount.toFixed(2)),
        notes: data.notes ?? null,
        status: 'pending',
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: new Decimal(item.price.toFixed(2)),
          })),
        },
      },
      include: { items: true },
    });

    this.publishEvent('order.created', { orderId: order.id, venueId: data.venueId, userId });
    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    this.publishEvent('order.status_updated', { orderId: id, status });
    return updated;
  }

  private async publishEvent(topic: string, payload: Record<string, unknown>) {
    try {
      const { Kafka } = require('kafkajs');
      const kafka = new Kafka({ brokers: [process.env.REDPANDA_BROKERS || 'localhost:9092'] });
      const producer = kafka.producer();
      await producer.connect();
      await producer.send({ topic, messages: [{ value: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }) }] });
      await producer.disconnect();
    } catch { /* silent - event publishing is non-critical */ }
  }
}
