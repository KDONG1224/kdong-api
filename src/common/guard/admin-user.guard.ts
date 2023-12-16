import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/service/auth.service';
import { RolesEnum } from 'src/users/consts/roles.const';
import { UsersService } from 'src/users/service/users.service';

@Injectable()
export class AdminUserGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      req.user = null;
      req.isAdmin = false;

      return true;
    } else {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const result = await this.authService.verifyToken(token);
      const user = await this.usersService.getUserById(result.userid);

      req.user = user;
      req.isAdmin = user.role === RolesEnum.ADMIN;

      return true;
    }
  }
}
