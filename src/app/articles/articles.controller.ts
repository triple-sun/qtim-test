import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { IAuthUser } from '../auth/auth.interfaces';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReqUser } from '../users/users.decorators';
import {
  ArticleIdDto,
  CreateArticleDto,
  QueryArticlesDto,
  UpdateArticleDto,
} from './articles.dto';
import { ArticleRdo } from './articles.rdo';
import { ArticlesService } from './articles.service';
import { ArticleExistsGuard } from './guards/article-exists.guard';
import { LoggerService } from '../logger/logger.service';

@ApiTags('articles')
@Controller(`articles`)
export class ArticlesController {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  @Public()
  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: Number,
    description: `ID статьи`,
  })
  @UseGuards(ArticleExistsGuard)
  @ApiOkResponse({ type: ArticleRdo, description: `Данные статьи` })
  @ApiNotFoundResponse({ type: NotFoundException })
  async findById(@Param() { id }: ArticleIdDto) {
    const article = await this.articlesService.findById(id);

    return this.returnOk(article);
  }

  @Public()
  @Get('/')
  @ApiQuery({ type: QueryArticlesDto })
  @ApiOkResponse({
    type: [ArticleRdo],
    description: `Данные статей`,
  })
  async findAll() {
    const articles = this.articlesService.findAll();

    return this.returnOk(articles);
  }

  @Public()
  @Get('/query')
  @ApiQuery({ type: QueryArticlesDto })
  @ApiOkResponse({
    type: [ArticleRdo],
    description: `Данные статей`,
  })
  async findMany(@Query() query: QueryArticlesDto) {
    const articles = this.articlesService.findMany(query);

    return this.returnOk(articles);
  }

  @Post(`/create`)
  @ApiBearerAuth()
  @ApiBody({
    type: CreateArticleDto,
    description: 'Данные для создания статьи',
  })
  @ApiOkResponse({
    type: ArticleRdo,
    description: `Данные созданного статьи`,
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateArticleDto, @ReqUser() user: IAuthUser) {
    const created = await this.articlesService.create(dto, user);

    return this.returnOk(created);
  }

  @Put(`/update/:id`)
  @UseGuards(ArticleExistsGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: `ID статьи`,
  })
  @ApiBody({
    type: CreateArticleDto,
    description: 'Данные для обновления статьи',
  })
  @ApiOkResponse({
    type: ArticleRdo,
    description: `Данные обновленного статьи`,
  })
  @UseGuards(JwtAuthGuard)
  async update(@Param() { id }: ArticleIdDto, @Body() dto: UpdateArticleDto) {
    const updated = await this.articlesService.update(id, dto);

    return this.returnOk(updated);
  }

  @Delete(`/delete/:id`)
  @UseGuards(ArticleExistsGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: Number,
    description: `ID статьи`,
  })
  @ApiOkResponse({
    type: ArticleRdo,
    description: `Данные удаленного статьи`,
  })
  @UseGuards(JwtAuthGuard)
  async delete(@Param() { id }: ArticleIdDto) {
    const deleted = await this.articlesService.delete(id);

    return this.returnOk(deleted);
  }

  private returnOk<T>(data: T) {
    this.logger.log(`Запрос обработан!`);

    return data;
  }
}
