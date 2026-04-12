import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class VendorGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    if (!result) return false;

    const user = context.switchToHttp().getRequest().user;
    if (user?.role !== 'vendor') {
      throw new ForbiddenException('Vendor access required');
    }

    return true;
  }
}
