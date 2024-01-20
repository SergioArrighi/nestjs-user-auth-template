import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserDocument } from './schemas/user.schema';
import { UUID } from './dtos/uuid.dto';
import { UUIDs } from './dtos/uuids.dto';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [UserController],
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
        UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    mockUserService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should invoke create service', async () => {
    const user = new User();
    const spy = jest
      .spyOn(mockUserService, 'create')
      .mockResolvedValue(user as UserDocument);
    await controller.create(user);
    expect(spy).toHaveBeenCalled();
  });

  it('should invoke bulk create service', async () => {
    const users = [new User(), new User()];
    const spy = jest
      .spyOn(mockUserService, 'createAll')
      .mockResolvedValue(users as UserDocument[]);
    await controller.createAll(users);
    expect(spy).toHaveBeenCalled();
  });

  it('should invoke find all service', async () => {
    const users = [new User(), new User()];
    const spy = jest
      .spyOn(mockUserService, 'findAll')
      .mockResolvedValue(users as UserDocument[]);
    await controller.findAll();
    expect(spy).toHaveBeenCalled();
  });

  it('should invoke find one service', async () => {
    const user = new User();
    const spy = jest
      .spyOn(mockUserService, 'findOne')
      .mockResolvedValue(user as UserDocument);
    await controller.findOne(new UUID());
    expect(spy).toHaveBeenCalled();
  });

  it('should invoke update service', async () => {
    const user = new User();
    const spy = jest
      .spyOn(mockUserService, 'update')
      .mockResolvedValue();
    await controller.update(new UUID(), user);
    expect(spy).toHaveBeenCalled();
  });

  it('should invoke bulk remove service', async () => {
    const spy = jest
      .spyOn(mockUserService, 'removeMany')
      .mockResolvedValue();
    await controller.remove(new UUIDs());
    expect(spy).toHaveBeenCalled();
  });
});
