import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from './users.module';
import { ClsModule } from 'nestjs-cls';
import { nanoid } from 'nanoid';
import { mockUserEntities } from './users.mocks';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: DeepMockProxy<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forFeature({
          name: UsersModule.name,
        }),
        ClsModule.forRoot({
          middleware: {
            mount: true,
            generateId: true,
            idGenerator: (req: Request) =>
              req.headers['X-Request-Id'] ?? nanoid(),
          },
          global: true,
        }),
      ],
      controllers: [UsersController],
      providers: [
        JwtService,
        {
          provide: UsersService,
          useValue: mockDeep(UsersService),
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign up an user by email and password', async () => {
    jest.spyOn(usersService, 'signUp').mockResolvedValue(mockUserEntities[0]);

    const createUserDto = {
      email: mockUserEntities[0].email,
      password: '123456',
    } as CreateUserDto;

    const result = await controller.create(createUserDto);

    expect(usersService.signUp).toHaveBeenCalled();
    expect(usersService.signUp).toHaveBeenCalledWith(createUserDto);

    expect(result).toEqual(mockUserEntities[0]);
  });

  it('should return an array of users', async () => {
    jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUserEntities);

    const result = await controller.findAll();

    expect(result).toEqual(mockUserEntities);
    expect(usersService.findAll).toHaveBeenCalled();
  });

  it('should find a user by email and return its data', async () => {
    jest
      .spyOn(usersService, 'findByEmail')
      .mockResolvedValue(mockUserEntities[0]);

    const result = await controller.findOne({
      email: mockUserEntities[0].email,
    });

    expect(result).toEqual(mockUserEntities[0]);
    expect(usersService.findByEmail).toHaveBeenCalled();
    expect(usersService.findByEmail).toHaveBeenCalledWith(
      mockUserEntities[0].email,
    );
  });

  it('should find a user by email and update its data', async () => {
    jest
      .spyOn(usersService, 'updateByEmail')
      .mockResolvedValue(mockUserEntities[0]);

    const email = mockUserEntities[0].email;
    const updateUserDto = {
      password: '12435256',
    } as UpdateUserDto;

    const result = await controller.update({ email }, updateUserDto);

    expect(result).toEqual(mockUserEntities[0]);
    expect(usersService.updateByEmail).toHaveBeenCalled();
    expect(usersService.updateByEmail).toHaveBeenCalledWith(
      email,
      updateUserDto,
    );
  });

  it('should find a user by email, remove and then return status', async () => {
    jest
      .spyOn(usersService, 'deleteByEmail')
      .mockResolvedValue({ deleted: true });

    const email = mockUserEntities[0].email;

    const result = await controller.delete({ email });

    expect(result).toEqual({ deleted: true });
    expect(usersService.deleteByEmail).toHaveBeenCalled();
    expect(usersService.deleteByEmail).toHaveBeenCalledWith(email);
  });
});
