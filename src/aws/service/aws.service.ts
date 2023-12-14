import { BadRequestException, Injectable } from '@nestjs/common';

// consts
import {
  ENV_AWS_S3_ACCESS_KEY,
  ENV_AWS_S3_REGION_KEY,
  ENV_AWS_S3_SCRETE_KEY,
  ENV_AWS_S3_BUCKET_NAME_KEY,
  ENV_AWS_S3_FOLDER_KEY
} from 'src/common/consts/env-keys.const';

// libraries
import { v4 as uuid } from 'uuid';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3';
import { extname } from 'path';

@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env[ENV_AWS_S3_REGION_KEY],
      credentials: {
        accessKeyId: process.env[ENV_AWS_S3_ACCESS_KEY],
        secretAccessKey: process.env[ENV_AWS_S3_SCRETE_KEY]
      }
    });

    this.bucketName = process.env[ENV_AWS_S3_BUCKET_NAME_KEY];
  }

  async uploadFileToS3(file: Express.Multer.File) {
    try {
      const folderName = `${process.env[ENV_AWS_S3_FOLDER_KEY]}/`;
      const fileName = `${uuid()}${extname(file.originalname)}`;

      const key = folderName + fileName;

      const data = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer
      };

      const s3Object = await this.s3Client.send(new PutObjectCommand(data));
      const location = this.getAwsS3FileUrl(key);

      return {
        ...s3Object,
        key,
        location,
        folderName,
        fileName,
        bucket: data.Bucket
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteFileFromS3(key: string) {
    try {
      const data = {
        Bucket: this.bucketName,
        Key: key
      };

      const s3Object = await this.s3Client.send(new DeleteObjectCommand(data));

      console.log('== deleteFileFromS3: s3Object == : ', s3Object);

      return s3Object;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getS3Object(fileKey: string) {
    try {
      const object = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey
        })
      );

      return object;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  public getAwsS3FileUrl(objectKey: string) {
    return `https://${this.bucketName}.s3.amazonaws.com/${objectKey}`;
  }
}
