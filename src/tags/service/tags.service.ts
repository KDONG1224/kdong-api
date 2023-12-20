import { BadRequestException, Injectable } from '@nestjs/common';
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
      post: { id: data.postId },
      tag: data.tag,
      sequence: data.sequence
    });

    await repository.save(newTag);

    return { ...newTag, message: '태그를 생성했습니다.' };
  }

  async deleteTag(fileIds: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const tagIds = fileIds.split(',');

    for (let i = 0; i < tagIds.length; i++) {
      const tag = await repository.findOne({
        where: {
          id: tagIds[i]
        }
      });

      if (!tag) {
        throw new BadRequestException('태그가 존재하지 않습니다.');
      }

      await repository.remove(tag);
    }

    return {
      message: '태그 삭제에 성공했습니다.'
    };
  }
}
