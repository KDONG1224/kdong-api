import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GuestbooksTable } from '../entity/guestbooks.entity';
import { Repository } from 'typeorm';
import { CreateGuestbookDto } from '../dto/create-guestbook.dto';
import { UpdateGuestbookDto } from '../dto/update-guestbook.dto';
import { ChangeExposeGuestbookDto } from '../dto/chage-expose-guestbook.dto';

// libraries
import * as bcrypt from 'bcrypt';
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
      message: '방명록 조회 성공'
    };
  }

  async pagePaginatePosts(dto: PaginateGuestbookDto) {
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

  async changeExposeGuestbook(body: ChangeExposeGuestbookDto) {
    const exposeIds = body.exposeIds.split(',');

    for (let i = 0; i < exposeIds.length; i++) {
      await this.guestbooksRepository.update(exposeIds[i], {
        expose: body.expose
      });
    }

    return {
      message: '공개 여부 변경 성공'
    };
  }
}
