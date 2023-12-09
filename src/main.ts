// base
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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

  app.enableCors({
    origin: true,
    credentials: true
  });

  const swagerConfig = new BaseAPIDocument().initializeOptions();
  const document = SwaggerModule.createDocument(app, swagerConfig);
  SwaggerModule.setup('v1/api', app, document);

  console.log('http://localhost:24189');

  await app.listen(process.env.PORT || 24189);
}
bootstrap();
