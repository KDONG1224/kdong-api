import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// modules
import { PostsModule } from './posts/module/posts.module';
import { CommonModule } from './common/module/common.module';
import { UsersModule } from './users/module/users.module';
import { AuthModule } from './auth/module/auth.module';
import { NoticeModule } from './notice/module/notice.module';
import { QnaModule } from './qna/module/qna.module';
import { TagsModule } from './tags/module/tags.module';

// controllers
import { AppController } from './app.controller';

// services
import { AppService } from './app.service';

// enitity
import { UsersTable } from './users/entity/users.entity';
import { PostsTable } from './posts/entity/posts.entity';
import { NoticeTable } from './notice/entities/notice.entity';
import { QnaTable } from './qna/entities/qna.entity';
import { TagsTable } from './tags/entity/tags.entity';

// guards
import { RolesGuard } from './users/guard/roles.guard';
import { AccessTokenGuard } from './auth/guard/bearer-token.guard';

// middlewares
import { LogMiddleware } from './common/middleware/log.middleware';

// consts
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY
} from './common/consts/env-keys.const';
import { FileTable } from './common/entites/file.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ENV_DB_HOST_KEY] || 'localhost',
      port: parseInt(process.env[ENV_DB_PORT_KEY]) || 5433,
      username: process.env[ENV_DB_USERNAME_KEY] || 'postgres',
      password: process.env[ENV_DB_PASSWORD_KEY] || 'postgres',
      database: process.env[ENV_DB_DATABASE_KEY] || 'postgres',
      entities: [
        UsersTable,
        PostsTable,
        NoticeTable,
        QnaTable,
        TagsTable,
        FileTable
      ],
      synchronize: true
    }),
    PostsModule,
    CommonModule,
    UsersModule,
    AuthModule,
    NoticeModule,
    QnaModule,
    TagsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },

    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    });
  }
}
