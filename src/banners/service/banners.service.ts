import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BannersTable } from '../entity/banners.entity';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(BannersTable)
    private readonly bannersRepository: Repository<BannersTable>
  ) {}

  async getBannerLists() {
    const bannerLists = await this.bannersRepository.find({
      where: { id: 'e58306bb-d417-45d4-8957-bab6603b6918' },
      relations: {
        bannerImages: true
      }
    });

    return {
      bannerLists,
      message: '배너 리스트 가져오기 성공'
    };
  }

  async createBanner(dto: CreateBannerDto) {
    const banner = this.bannersRepository.create({
      ...dto,
      bannerTitles: JSON.parse(dto.bannerTitles)
    });

    await this.bannersRepository.save(banner);

    return banner;
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const banner = await this.bannersRepository.findOne({
      where: { id },
      relations: {
        bannerImages: true
      }
    });

    if (!banner) {
      throw new BadRequestException('배너가 존재하지 않습니다.');
    }

    console.log('== banner == : ', banner);

    const data = {
      ...banner,
      ...dto,
      bannerTitles: JSON.parse(dto.bannerTitles)
    };

    await this.bannersRepository.save(data);

    const { bannerLists } = await this.getBannerLists();

    console.log('== bannerLists == : ', bannerLists);

    return {
      bannerLists,
      message: '배너 수정하기 성공'
    };
  }

  async deleteBanner(id: string) {
    const banner = await this.bannersRepository.findOne({
      where: { id }
    });

    if (!banner) {
      throw new BadRequestException('배너가 존재하지 않습니다.');
    }

    await this.bannersRepository.remove(banner);

    return {
      message: '배너 삭제하기 성공'
    };
  }
}
