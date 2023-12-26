// base
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Request } from 'express';

// setvices
import { CommentsService } from '../service/comments.service';

// entites
import { UsersTable } from 'src/users/entity/users.entity';

// consts
import { RolesEnum } from 'src/users/consts/roles.const';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersTable;
    };

    const { user } = req;

    if (user && user.role === RolesEnum.ADMIN) {
      return true;
    }

    const commentId = req.params.commentId;

    if (!commentId) {
      throw new BadRequestException('Comment ID가 파라미터로 제공돼야합니다.');
    }

    const isOk = await this.commentService.isCommentMine(commentId, req.body);

    if (!isOk) {
      throw new ForbiddenException('비밀번호가 틀렸습니다.');
    }

    return true;
  }
}
