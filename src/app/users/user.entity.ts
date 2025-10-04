import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
  BeforeInsert,
} from 'typeorm';
import type { ArticleEntity } from '../articles/article.entity';
import { Exclude, Expose, instanceToPlain } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { compare, genSalt, hash } from 'bcrypt';
import { IUser } from './user.interface';

@Entity()
export class UserEntity extends BaseEntity implements IUser {
  @Expose()
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Expose()
  @Column({ unique: true })
  @ApiProperty({ type: String, description: 'Email пользователя' })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await genSalt();
    this.password = await hash(password || this.password, salt);
  }

  @Expose()
  @OneToMany('ArticleEntity', (article: ArticleEntity) => article.createdBy, {
    cascade: true,
  })
  articles: ArticleEntity[];

  @Expose()
  @CreateDateColumn()
  createdAt: Date;
  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;

  toJson() {
    return instanceToPlain(this);
  }

  async validatePassword(password: string) {
    if (!password || !this.password) return false;

    return await compare(password, this.password);
  }
}
