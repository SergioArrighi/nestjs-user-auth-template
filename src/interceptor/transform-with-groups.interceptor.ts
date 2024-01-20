import {
    CallHandler,
    ClassSerializerInterceptor,
    ExecutionContext,
    Injectable,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  
  @Injectable()
  export class TransformWithGroupsInterceptor extends ClassSerializerInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const { user } = context.switchToHttp().getRequest();
      if (user)
        Reflect.defineMetadata(
          'class_serializer:options',
          { groups: user.roles },
          context.getHandler(),
        );
      return super.intercept(context, next);
    }
  }
  