import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { EmailAlreadyExistsGuard } from './guards/email-already-exists.guard';
import { UserExistsGuard } from './guards/user-exists.guard';
import { CreateUserDto, UpdateUserDto, UserEmailParamDto } from './users.dto';
import { UsersService } from './users.service';
import { LoggerService } from '../logger/logger.service';
import { UserRdo } from './users.rdo';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@ApiTags('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly logger: LoggerService,
    private readonly userService: UsersService,
  ) {}

  @Get('/:email')
  @UseGuards(UserExistsGuard)
  @ApiBearerAuth()
  @ApiNotFoundResponse({ type: NotFoundException })
  @ApiOkResponse({ type: UserRdo, description: `Данные пользователя` })
  async findOne(@Param() { email }: UserEmailParamDto) {
    const user = await this.userService.findByEmail(email);

    return this.returnOk(user);
  }

  @Get('/')
  @ApiBearerAuth()
  @ApiOkResponse({ type: [UserRdo], description: `Данные пользователей` })
  async findAll() {
    const users = await this.userService.findAll();

    return this.returnOk(users);
  }

  @Post(`/create`)
  @ApiBearerAuth()
  @UseGuards(EmailAlreadyExistsGuard)
  @ApiOkResponse({ type: UserRdo, description: `Данные пользователя` })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.signUp(dto);

    return this.returnOk(user);
  }

  @Put(`/update/:email`)
  @ApiBearerAuth()
  @UseGuards(UserExistsGuard)
  @ApiOkResponse({ type: UserRdo, description: `Данные пользователя` })
  async update(@Param() { email }: UserEmailParamDto, @Body() dto: UpdateUserDto) {
    const user = await this.userService.update(email, dto);

    return this.returnOk(user);
  }

  @Delete(`/delete/:email`)
  @ApiBearerAuth()
  @UseGuards(UserExistsGuard)
  @ApiOkResponse({
    type: class DeletedRdo {
      deleted: boolean;
    },
    description: `Результат операции`,
  })
  async delete(@Param() { email }: UserEmailParamDto) {
    const deleted = await this.userService.delete(email);

    return this.returnOk(deleted);
  }

  private returnOk<T>(data: T) {
    this.logger.log(`Запрос обработан!`);
    return data;
  }
}
