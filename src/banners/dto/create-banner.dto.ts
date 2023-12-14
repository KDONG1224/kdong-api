import { PickType } from '@nestjs/mapped-types';
import { BannersTable } from '../entity/banners.entity';
import { IsString } from 'class-validator';

export class CreateBannerDto extends PickType(BannersTable, [
  'playSpeed',
  'autoPlay'
]) {
  @IsString()
  bannerTitles: string;
}
