import { Module } from '@nestjs/common';
import { FaqsService } from '../service/faqs.service';
import { FaqsController } from '../controller/faqs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqsTable } from '../entity/faqs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FaqsTable])],
  controllers: [FaqsController],
  providers: [FaqsService],
  exports: [FaqsService]
})
export class FaqsModule {}
