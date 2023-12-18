// base
import { Column, Entity, OneToMany } from 'typeorm';
import { IsString } from 'class-validator';

// entities
import { BaseTable } from 'src/common/entites/base.entity';
import { FileTable } from 'src/common/entites/file.entity';

@Entity()
export class GuestbooksTable extends BaseTable {
  @Column()
  @IsString()
  guestName: string;

  @Column()
  @IsString()
  content: string;

  @Column()
  @IsString()
  guestPassword: string;

  @Column({
    default: true
  })
  @IsString()
  expose: boolean;

  @OneToMany(() => FileTable, (file) => file.guestbook)
  guestbookFiles: FileTable[];
}
