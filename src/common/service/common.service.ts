// base
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
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
// import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fromPath, fromBuffer } from 'pdf2pic';
import { Readable } from 'stream';

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
    // eslint-disable-next-line prefer-const
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        const parsedWhere = this.parseWhereFilter(key, value);

        for (const field in parsedWhere) {
          if (parsedWhere.hasOwnProperty(field)) {
            if (
              where[field] &&
              typeof parsedWhere[field] === 'object' &&
              typeof where[field] === 'object'
            ) {
              where[field] = {
                ...where[field],
                ...parsedWhere[field]
              };
            } else {
              where[field] = parsedWhere[field];
            }
          }
        }
      } else if (key.startsWith('order__')) {
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
    } else if (split.length === 3) {
      const [_, field, key] = split;

      if (!where[field]) {
        where[field] = {};
      }

      where[field][key] = value;
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
    type: { id: string; type: string },
    file: Express.Multer.File & BaseFileUploadDto,
    qr?: QueryRunner
  ) {
    const repository = this.getRepository(qr);

    const resUpload = await this.awsService.uploadFileToS3(file);

    let data: any = {
      originalname: file.originalname,
      filename: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      bucket: resUpload.bucket,
      key: resUpload.key,
      folder: resUpload.folderName.replace('/', ''),
      location: resUpload.location,
      sequence: file.sequence || 1
    };

    if (type) {
      data = {
        ...data,
        [type.type]: {
          id: type.id
        }
      };
    }

    if (userId !== '') {
      data = {
        ...data,
        author: {
          id: userId
        }
      };
    }

    const upload = repository.create(data);
    const save = await repository.save(upload);

    return {
      ...save,
      message: '파일 업로드에 성공했습니다.'
    };
  }

  async findFile(fileIds?: string) {
    const lists = [];

    if (fileIds) {
      const ids = fileIds.split(',');

      for (let i = 0; i < ids.length; i++) {
        const file = await this.fileRepository.findOne({
          where: {
            id: ids[i]
          }
        });

        if (!file) {
          throw new BadRequestException('파일이 존재하지 않습니다.');
        }

        lists.push(file);
      }
    }

    return {
      find: lists.sort((a, b) => a.sequence - b.sequence),
      message: '파일 조회에 성공했습니다.'
    };
  }

  async deleteFile(userId: string, fileIds?: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    if (fileIds) {
      const ids = fileIds.split(',');

      for (let i = 0; i < ids.length; i++) {
        const file = await repository.findOne({
          where: {
            id: ids[i]
          }
        });

        console.log('== deleteFile == : file', file);

        if (!file) {
          throw new BadRequestException('파일이 존재하지 않습니다.');
        }

        await this.awsService.deleteFileFromS3(file.key);
        await repository.remove(file);
      }
    }

    return {
      message: '파일 삭제에 성공했습니다.'
    };
  }

  saveBufferToTempFile(file: Express.Multer.File) {
    const id = uuidv4();
    const tempDir = path.join(__dirname, '../../../public/temp');
    const tempFilePath = path.join(tempDir, `${id}.pdf`);

    // temp 디렉터리가 존재하지 않으면 생성
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(tempFilePath, file.buffer);
    return { dir: tempDir, path: tempFilePath, filename: id };
  }

  convertToMulterFileObject(filePath: string, filename: string) {
    const fullFilePath = path.join(filePath, filename);

    const fileStats = fs.statSync(fullFilePath);

    return {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: filePath,
      filename: filename,
      path: fullFilePath,
      size: fileStats.size
    };
  }

  deleteTempFile(path: string) {
    fs.unlinkSync(path);
  }

  async convertPdfToImages(
    userId: string,
    file: Express.Multer.File & BaseFileUploadDto,
    book: any,
    qr: QueryRunner
  ) {
    const tempFilePath = this.saveBufferToTempFile(file);
    const pdfDoc = await PDFDocument.load(file.buffer);
    const totalPages = pdfDoc.getPageCount();

    const options = {
      density: 100,
      saveFilename: tempFilePath.filename,
      savePath: path.join(__dirname, '../../../public/images'),
      format: 'jpeg',
      width: book.width,
      height: book.height
    };

    const convert = fromPath(tempFilePath.path, options);

    const result = [];
    const imageBuffers = [];

    /**
     * PDF -> Image 변환
     */
    for (let i = 1; i <= totalPages; i++) {
      const res = await convert(i, { responseType: 'image' })
        .then((data) => data)
        .then(async (image) => {
          return await convert(i, { responseType: 'buffer' }).then((res) => {
            const fileStats = fs.statSync(image.path);

            return {
              fieldname: 'file',
              originalname: image.name,
              encoding: '7bit',
              mimetype: 'image/jpeg',
              destination: image.path,
              filename: image.name,
              path: image.path,
              size: fileStats.size,
              buffer: res.buffer
            };
          });
        })
        .catch((err) => {
          console.log('Error: ', err);

          throw new InternalServerErrorException(
            '이미지 변환에 실패했습니다. 다시 시도해주세요.'
          );
        });

      imageBuffers.push(res);
    }

    /**
     * Image -> AWS S3 업로드
     */
    for (let i = 0; i < imageBuffers.length; i++) {
      const image = await this.uploadFile(
        userId,
        { id: book.id, type: 'book' },
        { ...imageBuffers[i], sequence: i + 1 },
        qr
      );

      result.push(image);
    }

    this.deleteTempFile(tempFilePath.path);

    for (let i = 0; i < imageBuffers.length; i++) {
      this.deleteTempFile(imageBuffers[i].path);
    }

    return {
      bookImages: result,
      message: '이미지 변환에 성공했습니다.'
    };
  }

  // async cutImages(
  //   images: any,
  //   targetWidth: any,
  //   targetHeight: any,
  //   originalFilename: any
  // ) {
  //   const cutImages = [];
  //   const baseFilename = originalFilename.replace(/\.[^/.]+$/, '');
  //   for (let i = 0; i < images.length; i++) {
  //     const pageNumber = i + 1;
  //     const leftCut = await sharp(images[i])
  //       .extract({ left: 0, top: 0, width: targetWidth, height: targetHeight })
  //       .toBuffer();
  //     const leftFilename = `${baseFilename}_page${pageNumber}_left.png`;
  //     const rightCut = await sharp(images[i])
  //       .extract({
  //         left: images.imageWidth - targetWidth,
  //         top: 0,
  //         width: targetWidth,
  //         height: targetHeight
  //       })
  //       .toBuffer();
  //     const rightFilename = `${baseFilename}_page${pageNumber}_right.png`;
  //     cutImages.push(
  //       { buffer: leftCut, filename: leftFilename },
  //       { buffer: rightCut, filename: rightFilename }
  //     );
  //   }
  //   return cutImages;
  // }

  async reorderImages(images: any) {
    if (images.length < 2) return images;
    const firstImage = images.shift();
    const lastImage = images.pop();
    return [firstImage, ...images, lastImage];
  }
}
