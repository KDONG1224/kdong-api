// base
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';

// entites;
import { BaseTable } from 'src/common/entites/base.entity';
import { FileTable } from 'src/common/entites/file.entity';

// dtos
import { BannerTitleDto } from '../dto/banner-title.dto';

@Entity()
export class BannersTable extends BaseTable {
  @OneToMany(() => FileTable, (file) => file.banner)
  @ApiProperty({ description: '배너 이미지', required: false })
  bannerImages?: FileTable[];

  @Column({
    default: 4
  })
  @IsNumber()
  @ApiProperty({ description: '배너 재생 속도' })
  playSpeed: number;

  @Column({
    default: true
  })
  @IsBoolean()
  @ApiProperty({ description: '배너 자동 재생 여부' })
  autoPlay: boolean;

  @Column({ type: 'jsonb' })
  @ApiProperty({ description: '배너 제목' })
  bannerTitles: BannerTitleDto[];
}
