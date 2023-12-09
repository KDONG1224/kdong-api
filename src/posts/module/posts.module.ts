// base
import { BadRequestException, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { extname } from 'path';

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
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

// libraries
import { v4 as uuid } from 'uuid';
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

// consts
import {
  ENV_AWS_S3_ACCESS_KEY,
  ENV_AWS_S3_BUCKET_NAME_KEY,
  ENV_AWS_S3_FOLDER_KEY,
  ENV_AWS_S3_REGION_KEY,
  ENV_AWS_S3_SCRETE_KEY
} from 'src/common/consts/env-keys.const';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    TypeOrmModule.forFeature([PostsTable]),
    MulterModule.register({
      limits: {
        fieldSize: 25 * 1024 * 1024
      },
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname);

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return callback(
            new BadRequestException('JPG, JPEG, PNG 만 업로드가 가능합니다.'),
            false
          );
        }

        return callback(null, true);
      },
      storage: multerS3({
        s3: new S3Client({
          region: process.env[ENV_AWS_S3_REGION_KEY],
          credentials: {
            accessKeyId: process.env[ENV_AWS_S3_ACCESS_KEY],
            secretAccessKey: process.env[ENV_AWS_S3_SCRETE_KEY]
          }
        }),
        bucket: process.env[ENV_AWS_S3_BUCKET_NAME_KEY],
        metadata(req, file, callback) {
          callback(null, { owner: 'kdong' });
        },
        key: function (req, file, callback) {
          const folderName = `${process.env[ENV_AWS_S3_FOLDER_KEY]}/`;
          const fileName = `${uuid()}${extname(file.originalname)}`;

          callback(null, folderName + fileName);
        }
      })
    }),
    AuthModule,
    UsersModule,
    CommonModule,
    TagsModule
  ],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}
