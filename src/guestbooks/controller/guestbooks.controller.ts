import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { QueryRunner as QR } from 'typeorm';
import { GuestbooksService } from '../service/guestbooks.service';
import { CreateGuestbookDto } from '../dto/create-guestbook.dto';
import { UpdateGuestbookDto } from '../dto/update-guestbook.dto';
import { ChangeExposeGuestbookDto } from '../dto/chage-expose-guestbook.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { CommonService } from 'src/common/service/common.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { FileUploadDto } from 'src/aws/dto/file-upload.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BaseFileUploadDto } from 'src/common/dto/base-file-upload.dto';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { query } from 'express';
import { PaginateGuestbookDto } from '../dto/paginate-guestbook.dto';

@Controller('guestbooks')
export class GuestbooksController {
  constructor(
    private readonly guestbooksService: GuestbooksService,
    private readonly commonService: CommonService
  ) {}

  @Get()
  @IsPublic()
  async getGuestbooks(@Query() query: PaginateGuestbookDto) {
    if (!query.order__createdAt) {
      query.order__createdAt = 'DESC';
    }

    if (!query.take) {
      query.take = 20;
    }

    return await this.guestbooksService.getGuestbooks(query);
  }

  @Post()
  @IsPublic()
  @UseInterceptors(TransactionInterceptor)
  @FileUploadDto(['guestbookImages'])
  @UseInterceptors(FilesInterceptor('guestbookImages'))
  async createGuestbook(
    @Body() body: CreateGuestbookDto,
    @UploadedFiles()
    guestbookImages: Array<Express.Multer.File & BaseFileUploadDto>,
    @QueryRunner() qr: QR
  ) {
    const guestbook = await this.guestbooksService.createGuestbook(body);

    for (let i = 0; i < guestbookImages.length; i++) {
      await this.commonService.uploadFile(
        '',
        { id: guestbook.id, type: 'guestbook' },
        { ...guestbookImages[i], sequence: i + 1 },
        qr
      );
    }

    return guestbook;
  }

  @Patch(':id')
  async updateGuestbook(
    @Param('id') id: string,
    @Body() body: UpdateGuestbookDto
  ) {
    return await this.guestbooksService.updateGuestbook(id, body);
  }

  @Patch('expose')
  async changeExposeGuestbook(@Body() body: ChangeExposeGuestbookDto) {
    return await this.guestbooksService.changeExposeGuestbook(body);
  }
}
