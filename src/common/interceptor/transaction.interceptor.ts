// base
import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
  BadRequestException
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const qr = this.dataSource.createQueryRunner();

    await qr.connect();

    await qr.startTransaction();

    req.queryRunner = qr;

    return next.handle().pipe(
      catchError(async (error) => {
        await qr.rollbackTransaction();
        await qr.release();

        console.log('== error == : ', error);

        throw new BadRequestException(error.response.message.join('\n'));
      }),
      tap(async () => {
        await qr.commitTransaction();
        await qr.release();
      })
    );
  }
}
