import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminOrDjGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    if (!result) return false;

    const user = context.switchToHttp().getRequest().user;
    if (user?.role !== 'admin' && user?.role !== 'dj') {
      throw new ForbiddenException('Admin or DJ access required');
    }

    return true;
  }
}
