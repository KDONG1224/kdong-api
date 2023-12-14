import { IsNumber, IsString } from 'class-validator';

export class BannerTitleDto {
  @IsString()
  title: string;

  @IsNumber()
  playSpeed: number;

  @IsNumber()
  sequence: number;
}
