// base
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// constrollers,
import { CategoriesController } from '../controller/categories.controller';

// services
import { CategoriesService } from '../service/categories.service';

// entities
import { CategoriesTable } from '../entity/categories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriesTable])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
