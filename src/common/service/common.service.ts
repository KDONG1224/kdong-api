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

// services
import { BannersService } from 'src/banners/service/banners.service';
import { FaqsService } from 'src/faqs/service/faqs.service';

// entities
import { BaseTable } from '../entites/base.entity';
import { FileTable } from '../entites/file.entity';

// dtos
import { BasePaginationDto } from '../dto/base-pagination.dto';
import { BaseFileUploadDto } from '../dto/base-file-upload.dto';

// consts
import { FILTER_MAPPER } from '../consts/filter-mapper.const';
import { AwsService } from 'src/aws/service/aws.service';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(FileTable)
    private readonly fileRepository: Repository<FileTable>,
    private readonly awsService: AwsService,
    private readonly bannersService: BannersService,
    private readonly faqsService: FaqsService
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<FileTable>(FileTable)
      : this.fileRepository;
  }

  async getMainProfile() {
    const banner = await this.bannersService.getBannerLists();
    const faq = await this.faqsService.findAllFaqLists();

    return {
      bannerLists: banner.bannerLists,
      faqLists: faq.faqLists,
      message: '메인 프로필 조회에 성공했습니다.'
    };
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
    type: { id: string; type: 'post' | 'banner' },
    file: Express.Multer.File & BaseFileUploadDto,
    qr?: QueryRunner
  ) {
    const repository = this.getRepository(qr);
    const resUpload = await this.awsService.uploadFileToS3(file);

    const upload = repository.create({
      originalname: file.originalname,
      filename: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      bucket: resUpload.bucket,
      key: resUpload.key,
      folder: resUpload.folderName.replace('/', ''),
      location: resUpload.location,
      sequence: file.sequence,
      author: {
        id: userId
      },
      [type.type]: {
        id: type.id
      }
    });

    await repository.save(upload);

    return {
      ...upload,
      message: '파일 업로드에 성공했습니다.'
    };
  }

  async deleteFile(userId: string, fileIds: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const ids = fileIds.split(',');

    for (let i = 0; i < ids.length; i++) {
      const file = await repository.findOne({
        where: {
          id: ids[i]
        }
      });

      if (!file) {
        throw new BadRequestException('파일이 존재하지 않습니다.');
      }

      await this.awsService.deleteFileFromS3(file.key);
      await repository.remove(file);
    }

    return {
      message: '파일 삭제에 성공했습니다.'
    };
  }
}
