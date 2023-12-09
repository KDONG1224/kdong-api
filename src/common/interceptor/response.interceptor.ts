// base
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> {
    const now = new Date();

    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;

    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    return next.handle().pipe(
      map((observable) => {
        const { message, ...rest } = observable;

        return {
          code: 200,
          isSuccess: true,
          message,
          result: { ...rest }
        };
      })
    );
  }
}
