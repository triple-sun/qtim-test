import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthUserRdo } from '../auth.rdo';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/app/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,

    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('auth.jwtSecret'),
    });
  }

  async validate({ email }: AuthUserRdo) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException(`Пользователь не найден`);
    }

    return user;
  }
}
