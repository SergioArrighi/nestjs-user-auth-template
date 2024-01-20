import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '@/user/user.service';
import { User } from '@/user/schemas/user.schema';
import { Role } from '@/user/role/role.enum';
import { UserJwt } from './dtos/user-jwt.dto';
import { Signin } from './dtos/signin.dto';

describe('AuthService', () => {
  const rounds = 9;

  let service: AuthService;
  let mockUserService: UserService;
  let mockJwtService: JwtService;

  // Mock the config service
  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      // Return appropriate value when variable is requested
      if (key === 'APP_SALT') {
        return rounds.toString();
      }
      throw new Error(`Unexpected key: ${key}`);
    }),
  } as unknown as ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [{
        // Provider for the mongoose model
        provide: getModelToken(User.name),
        useValue: Model,
      },
      AuthService, JwtService, UserService],
    }).compile();

    mockUserService = module.get<UserService>(UserService);
    mockJwtService = module.get<JwtService>(JwtService);
    service = new AuthService(mockConfigService, mockUserService, mockJwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user', async () => {
    const password = '12345';
    const email = 'test@test.com'
    const salt = await bcrypt.genSalt(rounds);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user = {
      email,
      password: passwordHash,
    } as User;

    const spyFindOneByEmail = 
      jest.spyOn(mockUserService, 'findOneByEmail').mockResolvedValue(user);

    const result = await service.validateUser(user.email, password);

    expect(result).toBe(user);
    expect(spyFindOneByEmail).toHaveBeenCalled();
  });

  it('should signin user', async () => {
    const signin = {
      email: 'test@test.com',
      password: '12345',
    } as Signin;
    const user = {
      roles: [Role.Admin],
    } as User;

    const spySign = jest.spyOn(mockJwtService, 'sign').mockReturnValue('token');

    const result: UserJwt = await service.signin(signin, { user: user });

    expect(result.user).toStrictEqual(user);
    expect(spySign).toHaveBeenCalled();
  });
});
