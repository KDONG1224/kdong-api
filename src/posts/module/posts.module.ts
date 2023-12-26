// base
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// modules
import { UsersModule } from 'src/users/module/users.module';
import { AuthModule } from 'src/auth/module/auth.module';
import { CommonModule } from 'src/common/module/common.module';
import { TagsModule } from 'src/tags/module/tags.module';
import { CategoriesModule } from 'src/categories/module/categories.module';

// controllers
import { PostsController } from '../controller/posts.controller';

// services
import { PostsService } from '../service/posts.service';

// entities
import { PostsTable } from '../entity/posts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsTable]),
    AuthModule,
    UsersModule,
    CommonModule,
    TagsModule,
    CategoriesModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService]
})
export class PostsModule {}
