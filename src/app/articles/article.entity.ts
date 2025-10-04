import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BaseEntity,
  JoinColumn,
} from 'typeorm';
import type { UserEntity } from '../users/user.entity';
import { IArticle } from './article.interface';
import { instanceToPlain, Transform } from 'class-transformer';

@Entity()
export class ArticleEntity extends BaseEntity implements IArticle {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ type: Number, description: `ID статьи` })
  id: number;

  @Column()
  @ApiProperty({ type: String, description: `Название статьи` })
  title: string;

  @Column()
  @ApiProperty({ type: String, description: `Текст статьи` })
  text: string;

  @ManyToOne('UserEntity', (user: UserEntity) => user.articles, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy: UserEntity;

  @CreateDateColumn()
  @Transform(({ value }) => new Date(value))
  @ApiProperty({ type: String, description: `Дата создания` })
  createdAt: Date;

  @UpdateDateColumn()
  @Transform(({ value }) => new Date(value))
  @ApiProperty({ type: String, description: `Дата обновления` })
  updatedAt: Date;

  toJson() {
    return instanceToPlain(this);
  }
}
