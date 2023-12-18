import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { QueryRunner as QR } from 'typeorm';
import { ApiOperation } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

// services
import { BannersService } from '../service/banners.service';
import { CommonService } from 'src/common/service/common.service';

// dtos
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
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
import { UsersTable } from 'src/users/entity/users.entity';
import { FileUploadDto } from 'src/aws/dto/file-upload.dto';

@Controller('banners')
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly commonService: CommonService
  ) {}

  @Get()
  @ApiOperation({ summary: '배너 리스트 가져오기' })
  @IsPublic()
  async getBannerLists() {
    return await this.bannersService.getBannerLists();
  }

  @Post()
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: '배너 생성하기' })
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('thumbnails'))
  async createBanner(
    @User('id') id: string,
    @UploadedFiles() thumbnails: Array<Express.Multer.File & BaseFileUploadDto>,
    @Body() dto: CreateBannerDto,
    @QueryRunner() qr: QR
  ) {
    const banner = await this.bannersService.createBanner(dto);

    for (let i = 0; i < thumbnails.length; i++) {
      await this.commonService.uploadFile(
        id,
        { id: banner.id, type: 'banner' },
        { ...thumbnails[i], sequence: i + 1 },
        qr
      );
    }

    return { banner, message: '배너 생성에 성공했습니다.' };
  }

  @Patch(':id')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: '배너 수정하기' })
  @UseInterceptors(TransactionInterceptor)
  @FileUploadDto(['thumbnails'])
  @UseInterceptors(FilesInterceptor('thumbnails'))
  async updateBanner(
    @User() user: UsersTable,
    @Param('id') id: string,
    @UploadedFiles() thumbnails: Array<Express.Multer.File & BaseFileUploadDto>,
    @Body() dto: UpdateBannerDto,
    @QueryRunner() qr: QR
  ) {
    const banner = await this.bannersService.updateBanner(id, dto);

    await this.commonService.deleteFile(user.id, dto.hasThumbIds, qr);

    for (let i = 0; i < thumbnails.length; i++) {
      await this.commonService.uploadFile(
        user.id,
        { id, type: 'banner' },
        { ...thumbnails[i], sequence: i + 1 },
        qr
      );
    }

    return banner;
  }

  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: '배너 삭제하기' })
  async deleteBanner(@Param('id') id: string) {
    return await this.bannersService.deleteBanner(id);
  }
}
