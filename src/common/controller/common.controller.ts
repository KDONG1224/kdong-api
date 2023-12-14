// base
import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { QueryRunner as QR } from 'typeorm';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

// services
import { CommonService } from '../service/common.service';

// decorators
import { BaseFileUploadDto } from '../dto/base-file-upload.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersTable } from 'src/users/entity/users.entity';
import { QueryRunner } from '../decorator/query-runner.decorator';
import { TransactionInterceptor } from '../interceptor/transaction.interceptor';
import { IsPublic } from '../decorator/is-public.decorator';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('profile')
  @IsPublic()
  async getMainProfile() {
    return await this.commonService.getMainProfile();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async postUploadFile(
    @User() user: UsersTable,
    @UploadedFile()
    file: Express.Multer.File & BaseFileUploadDto
  ) {
    return await this.commonService.uploadFile(user.id, null, file);
  }

  @Post('uploads')
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files'))
  async postUploadFiles(
    @User() user: UsersTable,
    @UploadedFiles() files: Array<Express.Multer.File & BaseFileUploadDto>,
    @QueryRunner() qr: QR
  ) {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const res = await this.commonService.uploadFile(
        user.id,
        null,
        files[i],
        qr
      );

      results.push(res);
    }

    return {
      files: results,
      message: `${results.length}개의 파일을 업로드했습니다.`
    };
  }
}
