// base
import { NestFactory } from '@nestjs/core';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

// modules
import { AppModule } from './app.module';

// documents
import { BaseAPIDocument } from './common/swager/swager.document';

// filters
import { HttpExceptionFilter } from './common/exception-filter/http.exception-filter';
import { TransformInterceptor } from './common/interceptor/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * 모든곳에 적용되는 파이프
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  /**
   * CORS 설정
   */
  app.enableCors({
    origin: (origin, callback) => {
      if (origin) {
        const whiteList = process.env.REQUEST_URL_WHITE_LIST.split(',');

        if (whiteList.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new HttpException('Not Allowed By CORS', 400));
        }
      } else {
        callback(null, true);
      }
    },
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    credentials: true
  });

  const swagerConfig = new BaseAPIDocument().initializeOptions();
  const document = SwaggerModule.createDocument(app, swagerConfig);
  SwaggerModule.setup('v1/api', app, document);

  console.log('http://localhost:24181');

  await app.listen(process.env.PORT || 24181);
}
bootstrap();
