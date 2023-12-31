// base
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsNumber, IsOptional, IsString } from 'class-validator';

// entities
import { BaseTable } from './base.entity';
import { UsersTable } from 'src/users/entity/users.entity';
import { PostsTable } from 'src/posts/entity/posts.entity';
import { BannersTable } from 'src/banners/entity/banners.entity';
import { GuestbooksTable } from 'src/guestbooks/entity/guestbooks.entity';
import { BooksTable } from 'src/books/entity/books.entity';

@Entity()
export class FileTable extends BaseTable {
  @ManyToOne(() => UsersTable, (user) => user.files)
  author: UsersTable;

  @ManyToOne(() => PostsTable, (post) => post.thumbnails)
  post: PostsTable;

  @ManyToOne(() => BannersTable, (banner) => banner.bannerImages)
  banner: BannersTable;

  @ManyToOne(() => GuestbooksTable, (guestbook) => guestbook.guestbookFiles)
  guestbook: GuestbooksTable;

  @ManyToOne(() => BooksTable, (book) => book.pages)
  book: BooksTable;

  @Column({
    default: 1
  })
  @IsNumber()
  @IsOptional()
  sequence?: number;

  @Column()
  @IsString()
  originalname: string;

  @Column()
  @IsString()
  filename: string;

  @Column()
  @IsString()
  encoding: string;

  @Column()
  @IsString()
  mimetype: string;

  @Column()
  @IsNumber()
  size: number;

  @Column()
  @IsString()
  bucket: string;

  @Column()
  @IsString()
  key: string;

  @Column()
  @IsString()
  folder: string;

  @Column()
  @IsString()
  location: string;
}
