import { ApiProperty } from '@nestjs/swagger';

import { IAuthUser } from './auth.interfaces';

export class AuthUserRdo implements IAuthUser {
  @ApiProperty({ type: String, description: 'Email пользователя' })
  email: string;
  @ApiProperty({ type: Date, description: 'Дата создания пользователя' })
  createdAt: Date;
  @ApiProperty({ type: Date, description: 'Дата обновления пользователя' })
  updatedAt: Date;
}

export class AuthRdo extends AuthUserRdo {
  @ApiProperty({ type: String, description: 'Токен авторизации пользователя' })
  token: string;
}
