import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArticlesService } from '../articles.service';

@Injectable()
export class ArticleExistsGuard implements CanActivate {
  constructor(private articlesService: ArticlesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { id } = context.switchToHttp().getRequest().params;

    const article = await this.articlesService.findById(+id);

    if (!article) {
      throw new NotFoundException(`Статья [${id}] не найдена!`);
    }

    return true;
  }
}
