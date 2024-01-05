import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GuestbooksTable } from '../entity/guestbooks.entity';
import { Repository } from 'typeorm';
import { CreateGuestbookDto } from '../dto/create-guestbook.dto';
import { UpdateGuestbookDto } from '../dto/update-guestbook.dto';
import { ChangeExposeGuestbookDto } from '../dto/chage-expose-guestbook.dto';

// libraries
import * as bcrypt from 'bcryptjs';
import { PaginateGuestbookDto } from '../dto/paginate-guestbook.dto';
import { CommonService } from 'src/common/service/common.service';

@Injectable()
export class GuestbooksService {
  constructor(
    @InjectRepository(GuestbooksTable)
    private readonly guestbooksRepository: Repository<GuestbooksTable>,
    private readonly commonService: CommonService
  ) {}

  async getGuestbooks(query: PaginateGuestbookDto) {
    const result = await this.pagePaginatePosts(query);

    return {
      guestbooks: result.data,
      totalElements: result.total,
      message: '방명록 조회 성공'
    };
  }

  async pagePaginatePosts(dto: PaginateGuestbookDto) {
    console.log('== dto == : ', dto);

    return await this.commonService.paginate(dto, this.guestbooksRepository, {
      relations: {
        guestbookFiles: true
      }
    });
  }

  async createGuestbook(body: CreateGuestbookDto) {
    const hash = await bcrypt.hash(body.guestPassword, 10);

    this.guestbooksRepository.create({ ...body, guestPassword: hash });

    const save = await this.guestbooksRepository.save(body);

    return {
      ...save,
      message: '방명록 생성 성공'
    };
  }

  async updateGuestbook(id: string, body: UpdateGuestbookDto) {
    const guestbook = await this.guestbooksRepository.findOne({
      where: { id }
    });

    if (!guestbook) {
      throw new BadRequestException('존재하지 않는 방명록입니다.');
    }

    await this.guestbooksRepository.update(id, { ...body });

    return {
      message: '방명록 수정 성공'
    };
  }

  async changeExposeGuestbook(id: string, body: ChangeExposeGuestbookDto) {
    const guestbook = await this.guestbooksRepository.findOne({
      where: { id }
    });

    if (!guestbook) {
      throw new BadRequestException('존재하지 않는 방명록입니다.');
    }

    await this.guestbooksRepository.update(id, { ...body });

    const result = {
      ...guestbook,
      ...body
    };

    return {
      ...result,
      message: `해당 방명록이 ${body.expose ? '노출' : '숨김'} 처리되었습니다.`
    };
  }
}
