import { UserEntity } from "../users/user.entity";

export interface IArticle {
  id: number;
  title: string;
  text: string;
  createdBy: UserEntity;
  createdAt: Date;
  updatedAt: Date;
}
