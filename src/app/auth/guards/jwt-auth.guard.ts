import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

import { IAuthUser } from '../auth.interfaces';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    /** Если публичный путь - проставляем юзера при наличии токена и пускаем дальше
     * Валидация данных происходит далее в @see AuthPublicUserExistsGuard
     */
    if (isPublic) {
      const request = context.switchToHttp().getRequest();

      const token = request.headers?.authorization?.split(' ')[1];

      const decoded: IAuthUser = this.jwtService.decode(token);

      if (decoded && decoded.email) {
        request.user = decoded;
      }

      return true;
    }
    return super.canActivate(context);
  }
}
