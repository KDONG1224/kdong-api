import { Module } from '@nestjs/common';
import { AwsService } from '../service/aws.service';
import { AwsController } from '../controller/aws.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    })
  ],
  controllers: [AwsController],
  providers: [AwsService],
  exports: [AwsService]
})
export class AwsModule {}
