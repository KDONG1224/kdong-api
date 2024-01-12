// base
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { QueryRunner as QR } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

// services
import { BooksService } from '../service/books.service';
import { CommonService } from 'src/common/service/common.service';

// entities
import { UsersTable } from 'src/users/entity/users.entity';

// dtos
import { CreateBookDto } from '../dto/create-book.dto';
import { FileUploadDto } from 'src/aws/dto/file-upload.dto';
import { BaseFileUploadDto } from 'src/common/dto/base-file-upload.dto';

// interceptors
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';

// decorators
import { User } from 'src/users/decorator/user.decorator';
import { Roles } from 'src/users/decorator/roles.decorator';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';

// consts
import { RolesEnum } from 'src/users/consts/roles.const';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly commonService: CommonService
  ) {}

  @Get()
  @IsPublic()
  @ApiOperation({ summary: '책 리스트 가져오기' })
  async getBooksLists() {
    return await this.booksService.getBooksLists();
  }

  @Get(':id')
  @IsPublic()
  @ApiOperation({ summary: '특정 책 가져오기' })
  async getBookById(@Param('id') id: string) {
    return await this.booksService.getBookById(id);
  }

  @Post()
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: '책 생성하기' })
  @UseInterceptors(TransactionInterceptor)
  @FileUploadDto(['files'])
  @UseInterceptors(FilesInterceptor('files'))
  async createBook(
    @User() user: UsersTable,
    @UploadedFiles() files: Array<Express.Multer.File & BaseFileUploadDto>,
    @Body() dto: CreateBookDto,
    @QueryRunner() qr: QR
  ) {
    const ext = files[0].mimetype.split('/')[1] === 'pdf';

    if (!ext) {
      throw new BadRequestException('pdf 파일만 업로드 가능합니다.');
    }

    const result = await this.booksService.createBook(user, dto, files[0]);

    const books = await this.commonService.convertPdfToImages(
      user.id,
      files[0],
      result.book,
      qr
    );

    await this.booksService.updateBook(result.book.id, {
      thumbnail: books[0].location
    });

    const res = this.booksService.getBookById(result.book.id);

    return {
      ...res,
      message: '책 생성하기 성공'
    };
  }

  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: '책 삭제하기' })
  async deleteBook(@Param('id') id: string) {
    return await this.booksService.deleteBook(id);
  }
}
