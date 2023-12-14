import { Controller } from '@nestjs/common';
import { AwsService } from '../service/aws.service';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}
}
