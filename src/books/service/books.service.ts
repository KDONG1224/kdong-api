// base
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// entities
import { BooksTable } from '../entity/books.entity';
import { UsersTable } from 'src/users/entity/users.entity';

// dtos
import { BaseFileUploadDto } from 'src/common/dto/base-file-upload.dto';
import { CreateBookDto } from '../dto/create-book.dto';

// libraries
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BooksTable)
    private readonly booksRepository: Repository<BooksTable>
  ) {}

  async getBooksLists() {
    const booksLists = await this.booksRepository.find({
      where: { expose: true },
      relations: {
        author: true,
        pages: true
      }
    });

    return {
      booksLists: booksLists.map((book) => ({
        ...book,
        pages: book.pages.sort((a, b) => a.sequence - b.sequence)
      })),
      message: '책 리스트 가져오기 성공'
    };
  }

  async getBookById(id: string) {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: {
        author: true,
        pages: true
      }
    });

    if (!book) {
      throw new BadRequestException('책이 존재하지 않습니다.');
    }

    return {
      book: {
        ...book,
        pages: book.pages.sort((a, b) => a.sequence - b.sequence)
      },
      message: '책 가져오기 성공'
    };
  }

  async createBook(
    user: UsersTable,
    dto: CreateBookDto,
    file: Express.Multer.File & BaseFileUploadDto
  ) {
    const pdfDoc = await PDFDocument.load(file.buffer);
    const totalPages = pdfDoc.getPageCount();

    const firstPage = pdfDoc.getPage(0);
    const { width: pageWidth, height: pageHeight } = firstPage.getSize();

    console.log('== dto == : ', dto);

    const book = this.booksRepository.create({
      ...dto,
      width: dto.isCutting ? dto.width : pageWidth,
      height: dto.isCutting ? dto.height : pageHeight,
      pageLength: totalPages,
      pages: [],
      author: {
        id: user.id
      }
    });

    console.log('== book == : ', book);

    await this.booksRepository.save(book);

    return {
      book,
      message: '책 생성하기 성공'
    };
  }

  async deleteBook(id: string) {
    const book = await this.booksRepository.findOne({
      where: { id }
    });

    if (!book) {
      throw new BadRequestException('책이 존재하지 않습니다.');
    }

    await this.booksRepository.delete({ id });

    return {
      message: '책 삭제하기 성공'
    };
  }
}
