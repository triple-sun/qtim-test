import { OmitType } from '@nestjs/swagger';
import { ArticleEntity } from './article.entity';

export class ArticleRdo extends OmitType(ArticleEntity, ['createdBy']) {}
