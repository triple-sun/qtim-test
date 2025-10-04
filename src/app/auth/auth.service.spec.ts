import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { genSalt, hash } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: DeepMockProxy<JwtService>;
  let usersService: DeepMockProxy<UsersService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [AuthService, JwtService, UsersService],
    })
      .overrideProvider(JwtService)
      .useValue(mockDeep<JwtService>())
      .overrideProvider(UsersService)
      .useValue(mockDeep<UsersService>())
      .compile();

    authService = module.get(AuthService);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should throw an NotFoundException if user is not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(undefined);

      await expect(
        authService.login({ email: 'test-2@email.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is not ok', async () => {
      const mockPassword = '123456';
      const mockUser = plainToInstance(UserEntity, {
        id: 0,
        email: 'test@email.com',
        passwordHash: await hash(mockPassword, await genSalt(10)),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(mockUser);

      await expect(
        authService.login({ email: mockUser.email, password: '234567' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user data if user is found and password is ok', async () => {
      const mockPassword = '123456';
      const mockUser = plainToInstance(UserEntity, {
        id: 0,
        email: 'test@email.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await mockUser.setPassword(mockPassword);

      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(mockUser);

      jwtService.signAsync.mockResolvedValueOnce('token');

      await expect(
        authService.login({ email: mockUser.email, password: mockPassword }),
      ).resolves.toEqual({
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.createdAt,
        token: 'token',
      });
    });
  });

  describe('sign up', () => {
    it('should call usersService.signUp', async () => {
      const mockPassword = '123456';
      const mockUser = plainToInstance(UserEntity, {
        id: 0,
        email: 'test@email.com',
        passwordHash: await hash(mockPassword, await genSalt(10)),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(usersService, 'signUp').mockResolvedValueOnce(mockUser);

      await expect(
        authService.signUp({ email: mockUser.email, password: mockPassword }),
      ).resolves.toEqual(mockUser);
    });
  });
});
