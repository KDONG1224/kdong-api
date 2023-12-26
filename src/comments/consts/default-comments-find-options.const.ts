// base
import { FindManyOptions } from 'typeorm';

// entites
import { CommentsTable } from '../entity/comments.entity';

export const DEFAULT_COMMENTS_FIND_OPTIONS: FindManyOptions<CommentsTable> = {
  // relations: {
  //   author: true
  // },
  // select: {
  //   author: {
  //     id: true,
  //     nickname: true
  //   }
  // }
};
