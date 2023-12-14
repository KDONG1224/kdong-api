import { Module, forwardRef } from '@nestjs/common';
import { BannersService } from '../service/banners.service';
import { BannersController } from '../controller/banners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannersTable } from '../entity/banners.entity';
import { CommonModule } from 'src/common/module/common.module';

import { AwsModule } from 'src/aws/module/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BannersTable]),
    AwsModule,
    forwardRef(() => CommonModule)
  ],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService]
})
export class BannersModule {}
