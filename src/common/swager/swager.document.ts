import { DocumentBuilder } from '@nestjs/swagger';

export class BaseAPIDocument {
  public builder = new DocumentBuilder();

  public initializeOptions() {
    return this.builder
      .setTitle('Kdong Dev Web Server')
      .setDescription(
        'Kdong Dev Web Server API Docs. You can use this API Docs to test API.'
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'Bearer',
          name: 'JWT',
          in: 'header'
        },
        'accessToken'
      )
      .build();
  }
}
