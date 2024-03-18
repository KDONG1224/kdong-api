// base
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Equal,
  LessThan,
  MoreThan,
  Not,
  QueryRunner,
  Repository
} from 'typeorm';

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
import {
  DEFAULT_POST_FIND_OPTIONS,
  EXPOSE_POST_FIND_OPTIONS
} from '../consts/default-post-find-options.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsTable)
    private readonly postsRepository: Repository<PostsTable>,
    private readonly commonService: CommonService
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<PostsTable>(PostsTable)
      : this.postsRepository;
  }

  async getAllPostsXml() {
    const articles = await this.postsRepository.find({
      where: { expose: true, mainExpose: true },
      order: { createdAt: 'DESC' }
    });

    const not = [
      '0a702bf0-e1f0-4aa4-8710-603df1241641',
      '0c2f0fbd-cb95-4b91-886f-b43dddf8fee8',
      '1edab77c-9bab-4593-91ab-29a71b12c1fe',
      '2eeea7cc-ee28-4811-8a50-8ea4b9e6b771',
      '49fc830f-3fff-453b-8f31-b6aef1045bf9',
      '50ee667f-a6e9-4797-9ebe-fbd8298f74e4',
      '5712f80a-ca0e-446a-8985-cf40770d586c',
      '6e67ef7e-b80b-4bd8-a2b2-2c9491a49e4f',
      '93990e72-cc09-4d72-8c50-a6f431bedd75',
      '9a0fd032-93ea-49b5-a45f-ca927107af03',
      'a6009041-4022-444a-883e-46ded68549d2',
      'ac8d7df7-b956-4f68-8efb-ab18fd9effc0',
      'b346587a-139e-4eb9-9f8a-3ab6b74f224d',
      'd9ea56fb-a825-4615-b7f3-d655a3555ba6',
      'f87275f1-f6d6-462e-b563-a7034c30c341',
      'fa66b6a9-0425-4a01-b81e-68e7e07c0c40'
    ];

    const result = articles.filter((a) => not.find((n) => n !== a.id));

    return {
      articles: result,
      message: '모든 게시글을 가져왔습니다.'
    };
  }

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

    const prevPost = await this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        createdAt: LessThan(post.createdAt),
        ...EXPOSE_POST_FIND_OPTIONS.where,
        category: {
          categoryNumber: post.category.categoryNumber
        }
      },
      order: { createdAt: 'DESC' },
      take: 1
    });

    const nextPost = await this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        createdAt: MoreThan(post.createdAt),
        id: Not(Equal(id)),
        ...EXPOSE_POST_FIND_OPTIONS.where,
        category: {
          categoryNumber: post.category.categoryNumber
        }
      },
      order: { createdAt: 'ASC' },
      take: 1
    });

    const readCount = !isAdmin ? post.readCount + 1 : post.readCount;

    if (!isAdmin) {
      await this.postsRepository.update({ id }, { readCount });
    }

    return {
      currentPost: {
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
        // thumbnails: post.thumbnails.map((item) => ({
        //   id: item.id,
        //   location: item.location,
        //   originalname: item.originalname,
        //   mimetype: item.mimetype,
        //   size: item.size,
        //   sequence: item.sequence
        // })),
        category: {
          id: post.category && post.category.id,
          categoryName: post.category && post.category.categoryName,
          categoryNumber: post.category && post.category.categoryNumber,
          subCategoryNumber: post.category && post.category.subCategoryNumber
        },
        readCount
      },
      prevPost: prevPost[0],
      nextPost: nextPost[0]
    };
  }

  async getRecommendPosts() {
    // const categories = await this.catergoiesService.getAllSubCategories();

    // console.log('== categories == : ', categories);

    const recommendLists = await this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        ...EXPOSE_POST_FIND_OPTIONS.where
      },
      order: { readCount: 'DESC' },
      take: 10
    });

    const referenceLists = await this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        ...EXPOSE_POST_FIND_OPTIONS.where,
        category: {
          categoryNumber: 2
        }
      },
      order: { updateAt: 'DESC' },
      take: 10
    });

    const algorithmLists = await this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        ...EXPOSE_POST_FIND_OPTIONS.where,
        category: {
          categoryNumber: 3
        }
      },
      order: { readCount: 'DESC' },
      take: 10
    });

    return {
      recommendLists: recommendLists.map((post) => ({
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
      })),
      referenceLists: referenceLists.map((post) => ({
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
      })),
      algorithmLists: algorithmLists.map((post) => ({
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
      })),
      message: '추천 게시글을 가져왔습니다.'
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
    const find = await this.postsRepository.findOne({
      where: { id },
      relations: {
        thumbnails: true,
        tags: true
      }
    });

    if (!find) {
      throw new NotFoundException('해당하는 게시글이 없습니다.');
    }

    const data = {
      ...find,
      ...post,
      tags: [],
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

  async incrementCommentCount(postId: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    await repository.increment({ id: postId }, 'commentCount', 1);
  }

  async decrementCommentCount(postId: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    await repository.decrement({ id: postId }, 'commentCount', 1);
  }
}
