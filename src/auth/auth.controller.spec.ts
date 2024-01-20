import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/user/user.service';
import { User } from '@/user/schemas/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserJwt } from './dtos/user-jwt.dto';
import { Signin } from './dtos/signin.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: AuthService;
  let mockUserService: UserService;

  // Mock the config service
  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      // Return appropriate value when variable is requested
      if (key === 'APP_SALT') {
        return '9';
      }
      throw new Error(`Unexpected key: ${key}`);
    }),
  } as unknown as ConfigService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [AuthController],
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
        AuthService, JwtService, UserService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    mockAuthService = module.get<AuthService>(AuthService);
    mockUserService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should signin', async () => {
    const spySignin = 
      jest.spyOn(mockAuthService, 'signin').mockResolvedValue(new UserJwt());
    await controller.signin(new Signin(), jest.fn());
    expect(spySignin).toHaveBeenCalled();
  });

  it('should signup new user', async () => {
    const password = '12345';
    const user = {
      id: '1',
      password,
    } as User;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = bcrypt.hashSync(user.password, salt);
    const spyPasswordHash = jest
      .spyOn(mockAuthService, 'passwordHash')
      .mockResolvedValue(passwordHash);
    const spyCreate = jest.
      spyOn(mockUserService, 'create').mockResolvedValue(user);
    await controller.signup(user);
    expect(bcrypt.compareSync(password, user.password)).toBeTruthy();
    console.log(user);
  })
});
