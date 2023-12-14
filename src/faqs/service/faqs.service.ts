import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FaqsTable } from '../entity/faqs.entity';
import { Repository } from 'typeorm';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(FaqsTable)
    private readonly faqsRepository: Repository<FaqsTable>
  ) {}

  async findAllFaqLists() {
    const faqLists = await this.faqsRepository.find({
      order: { sequence: 'ASC' }
    });

    return {
      faqLists,
      message: 'FAQ 목록 조회에 성공했습니다.'
    };
  }

  async findFaqList(id: string) {
    const faq = await this.faqsRepository.findOne({
      where: { id },
      order: { sequence: 'ASC' }
    });

    return {
      faq,
      message: 'FAQ 조회에 성공했습니다.'
    };
  }

  async createFaq(body: CreateFaqDto) {
    const allFaq = await this.faqsRepository.find();

    const lastItem = allFaq[allFaq.length - 1];

    const faq = this.faqsRepository.create({
      ...body,
      sequence: lastItem ? lastItem.sequence + 1 : 1
    });

    await this.faqsRepository.save(faq);

    return {
      faq: faq,
      message: 'FAQ가 성공적으로 등록되었습니다.'
    };
  }

  async updateFaq(id: string, body: UpdateFaqDto) {
    const faq = await this.findFaqList(id);

    if (!faq) {
      throw new BadRequestException('해당 FAQ가 존재하지 않습니다.');
    }

    const data = {
      ...faq,
      ...body
    };

    await this.faqsRepository.update(id, data);

    return {
      faq: data,
      message: 'FAQ가 성공적으로 수정되었습니다.'
    };
  }

  async updateExpose(id: string, body: { expose: boolean }) {
    if (body.expose) {
      const allFaq = await this.faqsRepository.find({
        where: { expose: true }
      });

      if (allFaq.length >= 5) {
        throw new BadRequestException('FAQ는 최대 5개까지 노출 가능합니다.');
      }
    }

    const result = await this.findFaqList(id);

    if (!result.faq) {
      throw new BadRequestException('해당 FAQ가 존재하지 않습니다.');
    }

    const data = {
      ...result.faq,
      expose: body.expose
    };

    const expose = data.expose ? '숨김' : '노출';

    await this.faqsRepository.update(id, data);

    return {
      faq: data,
      message: `FAQ가 성공적으로 ${expose}되었습니다.`
    };
  }
}
