import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces';
import { Injectable } from '@nestjs/common/decorators';
import { Observable } from 'rxjs';
import { Role } from './role/role.enum';

@Injectable()
export class UserIdGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    return !(
      req.user.roles.length === 1 &&
      req.user.roles.includes(Role.User) &&
      ((req.params.id !== undefined && req.params.id !== req.user._id) ||
        (req.body.user !== undefined && req.body.user !== req.user._id))
    );
  }
}
