import {  OmitType } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

export class UserRdo extends OmitType(UserEntity, ['articles']) {}
