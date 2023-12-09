// base
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';

// entities
import { UsersTable } from '../entity/users.entity';

// dtos
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersTable)
    private readonly usersRepository: Repository<UsersTable>
  ) {}

  async existUserId(userId: string) {
    const isExistUserId = await this.usersRepository.exist({
      where: { userid: userId }
    });

    if (isExistUserId) {
      throw new BadRequestException('이미 존재하는 아이디입니다.');
    } else {
      return {
        isSuccess: true,
        message: '사용 가능한 아이디입니다.'
      };
    }
  }

  async createUser(user: CreateUserDto) {
    // 유저네임 중복 체크
    const isExistUserName = await this.usersRepository.exist({
      where: { username: user.username }
    });

    if (isExistUserName) {
      throw new BadRequestException('이미 존재하는 사용자 이름입니다.');
    }

    const isExistEmail = await this.usersRepository.exist({
      where: { email: user.email }
    });

    if (isExistEmail) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const createUser = this.usersRepository.create({
      ...user
    });

    const newUser = await this.usersRepository.save(createUser);

    return newUser;
  }

  async getUserByUserId(userid: string) {
    const user = await this.usersRepository.findOne({
      where: { userid }
    });

    return instanceToPlain(user);
  }

  async getAllUsers() {
    const users = await this.usersRepository.findAndCount();

    return {
      users: users[0],
      totalElement: users[1]
    };
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findOne({ where: { userid: id } });

    return user;
  }
}
