// base
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// services
import { CommonService } from 'src/common/service/common.service';

// entities
import { PostsTable } from '../entity/posts.entity';

// dtos
import { CreatePostsDto } from '../dtos/create-posts.dto';
import { UpdatePostsDto } from '../dtos/update-posts.dto';
import { PaginatePostsDto } from '../dtos/paginate-posts.dto';

// consts
import { dummyPosts } from '../consts/dummy';
import { DEFAULT_POST_FIND_OPTIONS } from '../consts/default-post-find-options.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsTable)
    private readonly postsRepository: Repository<PostsTable>,
    private readonly commonService: CommonService
  ) {}

  async getAllPosts(dto: PaginatePostsDto) {
    const result = await this.pagePaginatePosts(dto);

    const articles = result.data.map((post) => ({
      ...post,
      author: {
        username: post.author.username,
        email: post.author.email,
        role: post.author.role
      },
      tags: post.tags.map((tag) => tag)
    }));

    return {
      articles,
      currentTotal: articles.length,
      total: result.total,
      message: '모든 게시글을 가져왔습니다.'
    };
  }

  async pagePaginatePosts(dto: PaginatePostsDto) {
    return await this.commonService.paginate(dto, this.postsRepository, {
      ...DEFAULT_POST_FIND_OPTIONS
    });
  }

  async getPostById(id: string) {
    const post = await this.postsRepository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: { id }
    });

    if (!post) {
      throw new NotFoundException('해당하는 포스트가 없습니다.');
    }

    const readCount = post.readCount + 1;

    await this.postsRepository.update({ id }, { readCount });

    return {
      ...post,
      readCount
    };
  }

  async createPosts(id: string, post: CreatePostsDto) {
    const newPost = this.postsRepository.create({
      author: {
        id
      },
      ...post,
      tags: [],
      thumbnails: [],
      readCount: 0,
      likeCount: 0,
      commentCount: 0
    });

    await this.postsRepository.save(newPost);

    return { ...newPost, message: '게시글이 생성되었습니다.' };
  }

  async generatePosts(userId: string) {
    for (let i = 0; i < 100; i++) {
      const dummyPost = dummyPosts[Math.floor(Math.random() * 20)];

      await this.createPosts(userId, {
        title: dummyPost.title + ` - 테스트 제목 ${i + 1}`,
        content: dummyPost.content + ` - 테스트 내용 ${i + 1}`
      });
    }

    return {
      message: '더미 게시글 생성 완료'
    };
  }

  async updatePosts(id: string, post: UpdatePostsDto) {
    const find = await this.postsRepository.findOne({ where: { id } });

    if (!find) {
      throw new NotFoundException('해당하는 게시글이 없습니다.');
    }

    const data = {
      ...find,
      ...post,
      tags: [],
      thumbnails: []
    };

    const result = await this.postsRepository.save(data);

    return result;
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('해당하는 포스트가 없습니다.');
    }

    const result = await this.postsRepository.delete({ id });

    return result;
  }

  async likePost(id: string) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('해당하는 포스트가 없습니다.');
    }

    const likeCount = post.likeCount + 1;

    await this.postsRepository.update({ id }, { likeCount });

    return likeCount;
  }

  async checkPostExists(id: string) {
    return await this.postsRepository.exist({ where: { id } });
  }

  async isPostMine(userId: string, postId: string) {
    const result = await this.postsRepository.exist({
      where: {
        id: postId,
        author: {
          id: userId
        }
      },
      relations: {
        author: true
      }
    });

    return result;
  }

  // async incrementCommentCount(postId: number, qr?: QueryRunner) {
  //   const repository = this.getRepository(qr);

  //   await repository.increment({ id: postId }, 'commentCount', 1);
  // }

  // async decrementCommentCount(postId: number, qr?: QueryRunner) {
  //   const repository = this.getRepository(qr);

  //   await repository.decrement({ id: postId }, 'commentCount', 1);
  // }
}
