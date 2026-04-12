import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import Redis from 'ioredis';

const LIMITS: Record<string, { max: number; windowSec: number }> = {
  '/v1/auth/register': { max: 5, windowSec: 3600 },
  '/v1/auth/send-otp': { max: 3, windowSec: 3600 },
  '/v1/auth/login': { max: 10, windowSec: 900 },
  '/v1/auth/verify-otp': { max: 10, windowSec: 900 },
  '/v1/waitlist': { max: 3, windowSec: 86400 },
  default: { max: 100, windowSec: 60 },
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis | null = null;

  constructor() {
    try {
      const url = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
      this.redis.connect().catch(() => {
        this.redis = null; // Disable rate limiting if Redis unavailable
      });
    } catch {
      this.redis = null;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.redis) return true; // Skip if Redis unavailable

    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const path = request.path;
    const key = `rl:${ip}:${path}`;

    const limit = LIMITS[path] || LIMITS['default'];

    try {
      const current = await this.redis.incr(key);
      if (current === 1) await this.redis.expire(key, limit.windowSec);

      if (current > limit.max) {
        throw new HttpException(
          { message: 'Too many requests. Please try again later.', statusCode: 429 },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      // Redis error — allow request through
    }

    return true;
  }
}
