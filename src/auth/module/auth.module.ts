import { Module } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/module/users.module';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
