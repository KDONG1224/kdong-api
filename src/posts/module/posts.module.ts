// base
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// modules
import { UsersModule } from 'src/users/module/users.module';
import { AuthModule } from 'src/auth/module/auth.module';

// controllers
import { PostsController } from '../controller/posts.controller';

// services
import { PostsService } from '../service/posts.service';

// entities
import { PostsTable } from '../entity/posts.entity';
import { CommonModule } from 'src/common/module/common.module';
import { TagsModule } from 'src/tags/module/tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsTable]),
    AuthModule,
    UsersModule,
    CommonModule,
    TagsModule
  ],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}
