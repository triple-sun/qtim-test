import {
  CanActivate,
  ConflictException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class EmailAlreadyExistsGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { email } = context.switchToHttp().getRequest().body;

    const user = await this.usersService.findByEmail(email);

    if (user) {
      throw new ConflictException(`Пользователь [${email}] уже существует!`);
    }

    return !user;
  }
}
