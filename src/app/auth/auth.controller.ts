import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../users/users.dto';
import { AuthLoginDto } from './auth.dto';
import { AuthService } from './auth.service';
import { EmailAlreadyExistsGuard } from '../users/guards/email-already-exists.guard';
import { UserRdo } from '../users/users.rdo';
import { AuthRdo } from './auth.rdo';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(`login`)
  @ApiOkResponse({ type: AuthRdo })
  loginUser(@Body() dto: AuthLoginDto) {
    return this.authService.login(dto);
  }

  @Post(`signup`)
  @UseGuards(EmailAlreadyExistsGuard)
  @ApiOkResponse({ type: UserRdo })
  signUp(@Body() dto: CreateUserDto) {
    return this.authService.signUp(dto);
  }
}
