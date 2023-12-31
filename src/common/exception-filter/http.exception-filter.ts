import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const now = new Date();

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const res = exception.getResponse();
    const message = JSON.parse(JSON.stringify(res)).message;

    console.log(`[REQ] ${request.url} ${now.toLocaleString('kr')}`);

    response.status(status).json({
      code: status,
      isSuccess: false,
      message: message,
      result: undefined
    });
  }
}
