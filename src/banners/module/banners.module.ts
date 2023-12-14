import { Module } from '@nestjs/common';
import { BannersService } from '../service/banners.service';
import { BannersController } from '../controller/banners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannersTable } from '../entity/banners.entity';
import { CommonModule } from 'src/common/module/common.module';

import { AwsModule } from 'src/aws/module/aws.module';

@Module({
  imports: [TypeOrmModule.forFeature([BannersTable]), CommonModule, AwsModule],
  controllers: [BannersController],
  providers: [BannersService]
})
export class BannersModule {}
