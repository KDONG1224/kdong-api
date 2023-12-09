import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { TagsTable } from '../entity/tags.entity';
import { CreateTagDto } from '../dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagsTable)
    private readonly tagsRepository: Repository<TagsTable>
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<TagsTable>(TagsTable)
      : this.tagsRepository;
  }

  async createTag(data: CreateTagDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const newTag = repository.create({
      post: { id: data.post.id },
      tag: data.tag
    });

    await repository.save(newTag);

    return { ...newTag, message: '태그를 생성했습니다.' };
  }
}
