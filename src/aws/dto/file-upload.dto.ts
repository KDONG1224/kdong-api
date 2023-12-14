// base
import { ApiBody } from '@nestjs/swagger';

export const FileUploadDto =
  (fileNames: string[]): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    let properties = {};
    fileNames.forEach((item) => {
      properties = {
        ...properties,
        [item]: {
          type: 'string',
          format: 'binary'
        }
      };
    });
    ApiBody({
      schema: {
        type: 'object',
        properties
      }
    })(target, propertyKey, descriptor);
  };
