import { Controller, Get, Param } from '@nestjs/common';
import { AwsService } from '../service/aws.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Get('object/:fileKey')
  @ApiExcludeEndpoint(true)
  async getObject(@Param('fileKey') fileKey: string) {
    return await this.awsService.getS3Object(fileKey);
  }
}
