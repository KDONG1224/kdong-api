import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AccessTokenGuard,
  RefreshTokenGuard
} from '../guard/bearer-token.guard';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserLoginDto } from '../dto/user-login.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @IsPublic()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'ACCESS_TOKEN 발급' })
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken
    };
  }

  @Post('token/refreh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'REFRESH_TOKEN 발급' })
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken
    };
  }

  @Post('login')
  @IsPublic()
  @ApiOperation({ summary: '로그인' })
  postLoginId(@Body() body: UserLoginDto) {
    return this.authService.loginWithId(body);
  }

  @Post('signup')
  @IsPublic()
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ description: '유저정보', type: RegisterUserDto })
  postRegisterId(@Body() body: RegisterUserDto) {
    return this.authService.registerWithUserId(body);
  }
}
