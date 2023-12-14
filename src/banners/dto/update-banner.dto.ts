import { IsOptional, IsString } from 'class-validator';
import { CreateBannerDto } from './create-banner.dto';

export class UpdateBannerDto extends CreateBannerDto {
  @IsString()
  @IsOptional()
  hasThumbIds?: string;
}
