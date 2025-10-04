import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @ApiProperty({ type: String, description: `Название статьи` })
  title: string;
  @IsString()
  @ApiProperty({ type: String, description: `Текст статьи` })
  text: string;
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: `Теги статьи`, required: false })
  tags?: string[] = [];
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: `Публичность статьи`,
    required: false,
  })
  public?: boolean = false;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsOptional()
  title?: string;
  @IsOptional()
  text?: string;
}

export class ArticleIdDto {
  @IsInt({ message: 'Некорректный id!' })
  @ApiProperty({ type: Number, description: `ID статьи` })
  id: number;
}

export class QueryArticlesDto {
  @IsInt()
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: `ID статьи`,
    required: false,
  })
  id?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: `Название статьи (включает)`,
    required: false,
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: `Текст статьи (включает)`,
    required: false,
  })
  text?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: `Автор статьи`,
    required: false,
  })
  createdByEmail?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: `Дата создания статьи`,
    required: false,
    example: `29.10.2024`,
  })
  createdAt?: string;

  @IsInt()
  @IsOptional()
  take?: number = 10;

  @IsInt()
  @IsOptional()
  page?: number = 0;
}
