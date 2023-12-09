// base
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  QueryRunner,
  Repository
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// entities
import { BaseTable } from '../entites/base.entity';
import { FileTable } from '../entites/file.entity';

// dtos
import { BasePaginationDto } from '../dto/base-pagination.dto';

// consts
import { FILTER_MAPPER } from '../consts/filter-mapper.const';
import { BaseFileUploadDto } from '../dto/base-file-upload.dto';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(FileTable)
    private readonly fileRepository: Repository<FileTable>
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<FileTable>(FileTable)
      : this.fileRepository;
  }

  async paginate<T extends BaseTable>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {}
  ) {
    return await this.pagePaginate(dto, repository, overrideFindOptions);
  }

  private async pagePaginate<T extends BaseTable>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {}
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions
    });

    return {
      data,
      total: count
    };
  }

  private composeFindOptions<T extends BaseTable>(
    dto: BasePaginationDto
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      // where__로 시작하면 where 필터를 파싱한다.
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value)
        };
      } else if (key.startsWith('order__')) {
        // order__로 시작하면 order 필터를 파싱한다.
        order = {
          ...order,
          ...this.parseWhereFilter(key, value)
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? (dto.page - 1) * dto.take : 0
    };
  }

  private parseWhereFilter<T extends BaseTable>(
    key: string,
    value: string
  ): FindOptionsWhere<T> {
    const where: FindOptionsWhere<T> = {};

    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2 또는 3이어야합니다 - 문제되는 키값 : ${key}`
      );
    }

    if (split.length === 2) {
      const [_, field] = split;

      where[field] = value;
    } else {
      const [_, field, operator] = split;

      const values = value.toString().split(',');

      where[field] = FILTER_MAPPER[operator](
        values.length > 1 ? values : value
      );
    }

    return where;
  }

  async uploadFile(
    userId: string,
    postId: string,
    file: Express.Multer.File & BaseFileUploadDto,
    qr?: QueryRunner
  ) {
    const repository = this.getRepository(qr);

    console.log('== file == : ', file);

    const folder = file.key.split('/')[0];
    const filename = file.key.split('/')[1];

    const upload = repository.create({
      originalname: file.originalname,
      filename: filename,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      bucket: file.bucket,
      key: file.key,
      folder: folder,
      location: file.location,
      contentType: file.contentType,
      sequence: file.sequence,
      author: {
        id: userId
      },
      post: {
        id: postId
      }
    });

    const result = await repository.save(upload);

    return {
      ...result,
      message: '파일 업로드에 성공했습니다.'
    };
  }
}
