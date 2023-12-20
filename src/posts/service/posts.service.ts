// base
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

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
      tags: post.tags
        .sort((a, b) => a.sequence - b.sequence)
        .map((item) => ({
          id: item.id,
          name: item.tag,
          sequence: item.sequence
        })),
      thumbnails: post.thumbnails.map((item) => ({
        id: item.id,
        location: item.location,
        originalname: item.originalname,
        mimetype: item.mimetype,
        size: item.size
      })),
      category: {
        id: post.category && post.category.id,
        categoryName: post.category && post.category.categoryName,
        categoryNumber: post.category && post.category.categoryNumber,
        subCategoryNumber: post.category && post.category.subCategoryNumber
      }
    }));

    return {
      articles,
      currentTotal: articles.length,
      total: result.total,
      message: '모든 게시글을 가져왔습니다.'
    };
  }

  async pagePaginatePosts(dto: PaginatePostsDto) {
    const { where__fromDate, where__toDate, ...rest } = dto;

    if (where__fromDate && where__toDate) {
      return await this.commonService.paginate(
        { ...rest },
        this.postsRepository,
        {
          ...DEFAULT_POST_FIND_OPTIONS,
          where: {
            createdAt: Between(
              new Date(where__fromDate),
              new Date(where__toDate)
            )
          }
        }
      );
    } else {
      return await this.commonService.paginate(dto, this.postsRepository, {
        ...DEFAULT_POST_FIND_OPTIONS
      });
    }
  }

  async getPostById(id: string, isAdmin?: boolean) {
    const post = await this.postsRepository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: { id }
    });

    if (!post) {
      throw new NotFoundException('해당하는 포스트가 없습니다.');
    }

    const readCount = !isAdmin ? post.readCount + 1 : post.readCount;

    if (!isAdmin) {
      await this.postsRepository.update({ id }, { readCount });
    }

    return {
      ...post,
      author: {
        username: post.author.username,
        email: post.author.email,
        role: post.author.role
      },
      tags: post.tags
        .sort((a, b) => a.sequence - b.sequence)
        .map((item) => ({
          id: item.id,
          name: item.tag,
          sequence: item.sequence
        })),
      thumbnails: post.thumbnails.map((item) => ({
        id: item.id,
        location: item.location,
        originalname: item.originalname,
        mimetype: item.mimetype,
        size: item.size
      })),
      category: {
        id: post.category && post.category.id,
        categoryName: post.category && post.category.categoryName,
        categoryNumber: post.category && post.category.categoryNumber,
        subCategoryNumber: post.category && post.category.subCategoryNumber
      },
      readCount
    };
  }

  async createPosts(id: string, post: CreatePostsDto) {
    const newPost = this.postsRepository.create({
      author: {
        id
      },
      ...post,
      category: {
        id: post.category
      },
      tags: [],
      thumbnails: [],
      readCount: 0,
      likeCount: 0,
      commentCount: 0
    });

    const save = await this.postsRepository.save(newPost);

    return { ...save, message: '게시글이 생성되었습니다.' };
  }

  async generatePosts(userId: string) {
    for (let i = 0; i < 100; i++) {
      const dummyPost = dummyPosts[Math.floor(Math.random() * 20)];

      await this.createPosts(userId, {
        title: dummyPost.title + ` - 테스트 제목 ${i + 1}`,
        content: dummyPost.content + ` - 테스트 내용 ${i + 1}`,
        mainColor: '#ffffff',
        subColor: '#f43f00'
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
      thumbnails: [],
      category: {
        id: post.category
      }
    };

    await this.postsRepository.save(data);

    const result = await this.getPostById(data.id, true);

    return {
      ...result,
      message: '게시글이 수정되었습니다.'
    };
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

  async exposePost(id: string, body: { expose: boolean }) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('해당하는 포스트가 없습니다.');
    }

    await this.postsRepository.update({ id }, { expose: body.expose });

    return {
      result: {
        ...post,
        expose: body.expose
      },
      message: `게시글이 ${body.expose ? '노출' : '숨김'} 처리되었습니다.`
    };
  }

  async mainExposePost(id: string, body: { mainExpose: boolean }) {
    if (body.mainExpose) {
      const allPosts = await this.postsRepository.find({
        where: { mainExpose: true }
      });

      if (allPosts.length >= 10) {
        throw new NotFoundException('메인 노출은 최대 10개까지 가능합니다.');
      }
    }

    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('해당하는 포스트가 없습니다.');
    }

    await this.postsRepository.update({ id }, { mainExpose: body.mainExpose });

    return {
      result: {
        ...post,
        mainExpose: body.mainExpose
      },
      message: `게시글이 ${body.mainExpose ? '노출' : '숨김'} 처리되었습니다.`
    };
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
