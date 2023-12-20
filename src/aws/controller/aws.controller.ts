import { Controller, Get, Param } from '@nestjs/common';
import { AwsService } from '../service/aws.service';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Get('object/:fileKey')
  async getObject(@Param('fileKey') fileKey: string) {
    return await this.awsService.getS3Object(fileKey);
  }
}
