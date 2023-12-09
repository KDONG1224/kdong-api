// base
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// controllers
import { TagsController } from '../controller/tags.controller';

// services
import { TagsService } from '../service/tags.service';

// entities
import { TagsTable } from '../entity/tags.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TagsTable])],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService]
})
export class TagsModule {}
