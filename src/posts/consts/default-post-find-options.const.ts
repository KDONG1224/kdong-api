import { FindManyOptions } from 'typeorm';
import { PostsTable } from '../entity/posts.entity';

export const DEFAULT_POST_FIND_OPTIONS: FindManyOptions<PostsTable> = {
  // relations: ['author', 'images'],
  relations: {
    author: true,
    tags: true,
    thumbnails: true,
    category: true
  }
};
