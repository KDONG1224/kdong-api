// base
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// moduels
import { AuthModule } from 'src/auth/module/auth.module';
import { PostsModule } from 'src/posts/module/posts.module';

// controllers
import { CommentsController } from '../controller/comments.controller';

// services
import { CommentsService } from '../service/comments.service';

// entites
import { CommentsTable } from '../entity/comments.entity';

// middleware
import { PostExistsMiddleware } from '../middleware/post-exists.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsTable]), AuthModule, PostsModule],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddleware).forRoutes(CommentsController);
  }
}
