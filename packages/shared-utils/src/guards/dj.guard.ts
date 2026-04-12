import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DjGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    if (!result) return false;

    const user = context.switchToHttp().getRequest().user;
    if (user?.role !== 'dj') {
      throw new ForbiddenException('DJ access required');
    }

    return true;
  }
}
