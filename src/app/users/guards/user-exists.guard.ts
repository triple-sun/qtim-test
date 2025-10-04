import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class UserExistsGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { email } = context.switchToHttp().getRequest().params;

    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException(`Пользователь [${email}] не найден!`);

    return !!user;
  }
}
