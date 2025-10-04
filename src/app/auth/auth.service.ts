import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from '../users/users.dto';
import { AuthLoginDto } from './auth.dto';
import { AuthRdo } from './auth.rdo';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login({ email, password }: AuthLoginDto): Promise<AuthRdo> {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException(`Пользователь не найден!`);

    const okPassword = await user.validatePassword(password);

    if (!okPassword) throw new UnauthorizedException(`Неверный пароль!`);
    /** Шифруем юзера в токен */
    const token = await this.jwtService.signAsync({ ...user });

    return {
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token,
    };
  }

  async signUp(dto: CreateUserDto) {
    return await this.usersService.signUp(dto);
  }
}
