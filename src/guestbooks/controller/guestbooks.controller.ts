// base
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryRunner as QR } from 'typeorm';
import { FilesInterceptor } from '@nestjs/platform-express';

// services
import { GuestbooksService } from '../service/guestbooks.service';
import { CommonService } from 'src/common/service/common.service';

// dtos
import { FileUploadDto } from 'src/aws/dto/file-upload.dto';
import { CreateGuestbookDto } from '../dto/create-guestbook.dto';
import { UpdateGuestbookDto } from '../dto/update-guestbook.dto';
import { PaginateGuestbookDto } from '../dto/paginate-guestbook.dto';
import { BaseFileUploadDto } from 'src/common/dto/base-file-upload.dto';
import { ChangeExposeGuestbookDto } from '../dto/chage-expose-guestbook.dto';

// interceptors
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';

// guards
import { AdminUserGuard } from 'src/common/guard/admin-user.guard';

// decorators
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';

@ApiTags('Guestbooks')
@Controller('guestbooks')
export class GuestbooksController {
  constructor(
    private readonly guestbooksService: GuestbooksService,
    private readonly commonService: CommonService
  ) {}

  @Get()
  @IsPublic()
  @UseGuards(AdminUserGuard)
  async getGuestbooks(
    @Req() req: Express.Request & { isAdmin: boolean },
    @Query() query: PaginateGuestbookDto
  ) {
    if (!query.order__createdAt) {
      query.order__createdAt = 'DESC';
    }

    if (!query.take) {
      query.take = 6;
    }

    console.log('== query == : ', query);
    console.log('== req.isAdmin == : ', req.isAdmin);

    if (!req.isAdmin) {
      query.where__expose = true;
    } else {
      delete query.where__expose;
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

  @Post('expose/:id')
  async changeExposeGuestbook(
    @Param('id') id: string,
    @Body() body: ChangeExposeGuestbookDto
  ) {
    return await this.guestbooksService.changeExposeGuestbook(id, body);
  }
}
