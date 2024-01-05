// base
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';

// services
import { UsersService } from 'src/users/service/users.service';

// entities
import { UsersTable } from 'src/users/entity/users.entity';

// dtos
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserLoginDto } from '../dto/user-login.dto';

// libraries
import * as bcrypt from 'bcryptjs';

// consts
import { ENV_JWT_SECRET_KEY } from 'src/common/consts/env-keys.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰 입니다.');
    }

    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(token: string) {
    const decoded = Buffer.from(token, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 인증 정보입니다.');
    }

    const userid = split[0];
    const password = split[1];

    return { userid, password };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env[ENV_JWT_SECRET_KEY]
      });
    } catch (e) {
      throw new UnauthorizedException('토큰이 만료됐거나 잘못된 토큰입니다.');
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.verifyToken(token);

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 Refresh 토큰만 가능합니다.'
      );
    }

    return this.signToken({ ...decoded }, isRefreshToken);
  }

  signToken(user: Pick<UsersTable, 'userid' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      userid: user.userid,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access'
    };

    return this.jwtService.sign(payload, {
      secret: process.env[ENV_JWT_SECRET_KEY],
      expiresIn: isRefreshToken ? 3600000 : 3600000
    });
  }

  async loginUser(user: Pick<UsersTable, 'userid' | 'id'>) {
    const userInfo = await this.usersService.getUserByUserId(user.userid);

    const result = {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
      userInfo
    };

    return result;
  }

  async authenticateWithUserIdAndPassword(user: UserLoginDto) {
    const existingUser = await this.usersService.getUserById(user.userid);

    if (!existingUser) {
      throw new UnauthorizedException('사용자가 존재하지 않습니다.');
    }

    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return existingUser;
  }

  async loginWithId(user: UserLoginDto) {
    const existingUser = await this.authenticateWithUserIdAndPassword(user);

    return await this.loginUser(existingUser);
  }

  async registerWithUserId(user: RegisterUserDto) {
    const hash = await bcrypt.hash(user.password, 10);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash
    });

    return {
      ...instanceToPlain(newUser),
      message: '회원가입 성공'
    };
  }
}
