// base
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';

// services
import { PostsService } from '../service/posts.service';

// entities
import { UsersTable } from 'src/users/entity/users.entity';

// consts
import { RolesEnum } from 'src/users/consts/roles.const';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersTable;
    };

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    if (user.role === RolesEnum.ADMIN) return true;

    const pId = req.params.postId;

    if (!pId) {
      throw new BadRequestException('postId를 입력해주세요.');
    }

    return this.postsService.isPostMine(user.id, pId);
  }
}
