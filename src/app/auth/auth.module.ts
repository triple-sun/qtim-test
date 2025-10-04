import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getJWTConfig } from 'src/config/auth.config';

import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';

@Global()
@Module({
  imports: [
    LoggerModule.forFeature({
      name: AuthModule.name,
    }),
    JwtModule.registerAsync(getJWTConfig()),
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
