import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

describe('UserService', () => {
  let service: UserService;
  const mockUserModel: jest.Mock = jest.fn();

  const id1 = '1';
  const user1 = {
    id: id1,
  } as User;
  
  const id2 = '2';
  const user2 = {
    id: id2,
  } as User;

  // Mocking the constructor of the user model mock
  let mockUserModelInstance1: any;
  let mockUserModelInstance2: any;

  const execMock = {
    exec: jest.fn(),
  }
  const leanMock = {
    lean: jest.fn().mockReturnValue(execMock),
  };

  // First call returns user1
  mockUserModel.mockImplementationOnce(() => mockUserModelInstance1);
  // Second call returns user2
  mockUserModel.mockImplementationOnce(() => mockUserModelInstance2);

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

  service = new UserService(mockConfigService, mockUserModel as unknown as Model<UserDocument>);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          // Provider for the mongoose model
          provide: getModelToken(User.name),
          useValue: Model,
        },
        UserService],
    }).compile();

    mockUserModelInstance1 = {
      save: jest.fn(),
      bulkSave: jest.fn(),
      toObject: jest.fn().mockReturnValueOnce(user1), // Return user1 for the first call
    };
    mockUserModelInstance2 = {
      save: jest.fn(),
      bulkSave: jest.fn(),
      toObject: jest.fn().mockReturnValueOnce(user2), // Return user1 for the first call
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user with hashed password', async () => {
    mockUserModel.mockImplementation(() => (mockUserModelInstance1));
    const saveSpy = jest.spyOn(mockUserModelInstance1, 'save');
    const toObjectSpy = jest.spyOn(mockUserModelInstance1, 'toObject');

    const result = await service.create(user1);
    
    expect(saveSpy).toHaveBeenCalled();
    expect(toObjectSpy).toHaveBeenCalled();
  });

  it('should create users in bulk with hashed password', async () => {
    (mockUserModel as unknown as Model<UserDocument>).bulkSave = jest.fn();

    const toObjectSpy1 = jest.spyOn(mockUserModelInstance1, 'toObject');
    const toObjectSpy2 = jest.spyOn(mockUserModelInstance2, 'toObject');

    const bulkSaveSpy = jest.spyOn(mockUserModel  as unknown as Model<UserDocument>, 'bulkSave');

    // NOTE: users may be returned in a different order
    const result: User[] = await service.createAll([user1, user2]);

    expect(result.length).toEqual(2);
    expect(toObjectSpy1).toHaveBeenCalled();
    expect(toObjectSpy2).toHaveBeenCalled();
    expect(bulkSaveSpy).toHaveBeenCalled();
  });

  it('should find all users', async () => {
    (mockUserModel as unknown as Model<UserDocument>).find = 
      jest.fn().mockReturnValue(leanMock);

    execMock.exec = jest.fn().mockReturnValueOnce([user1, user2]);
    const findSpy = jest.spyOn(mockUserModel as unknown as Model<UserDocument>, 'find');
  
    const result = await service.findAll();

    expect(result.length).toEqual(2);
    expect(findSpy).toHaveBeenCalled();
  });

  it('should find one user', async () => {
    (mockUserModel as unknown as Model<UserDocument>).findById = 
      jest.fn().mockReturnValue(leanMock);

    execMock.exec = jest.fn().mockReturnValueOnce(user1);
    const findSpy = jest.spyOn(mockUserModel as unknown as Model<UserDocument>, 'findById');

    const result = await service.findOne(id1);

    expect(result.id).toEqual(id1);
    expect(findSpy).toHaveBeenCalled();
  });

  it('should find one by email', async () => {
    const email = 'user1@test.com';
    user1.email = email;
    
    (mockUserModel as unknown as Model<UserDocument>).findOne = 
      jest.fn().mockReturnValue(leanMock);
    
    execMock.exec = jest.fn().mockReturnValueOnce(user1);
    const findOneSpy = jest.spyOn(mockUserModel as unknown as Model<UserDocument>, 'findOne');

    const result = await service.findOneByEmail(email);

    expect(result.email).toEqual(email);
    expect(findOneSpy).toHaveBeenCalled();
  });

  it('should update', async () => {
    (mockUserModel as unknown as Model<UserDocument>).findByIdAndUpdate = jest.fn();

    const findByIdAndUpdateSpy = 
      jest.spyOn(mockUserModel as unknown as Model<UserDocument>, 'findByIdAndUpdate');
    
    await service.update(id1, user1);

    expect(findByIdAndUpdateSpy).toHaveBeenCalled();
  })

  it('should remove', async () => {
    (mockUserModel as unknown as Model<UserDocument>).findByIdAndDelete = jest.fn();

    const findByIdAndDeleteSpy = 
      jest.spyOn(mockUserModel as unknown as Model<UserDocument>, 'findByIdAndDelete');
    
    await service.remove(id1);

    expect(findByIdAndDeleteSpy).toHaveBeenCalled();
  })

  it('should remove many', async () => {
    (mockUserModel as unknown as Model<UserDocument>).deleteMany = jest.fn();

    const deleteManySpy = 
      jest.spyOn(mockUserModel as unknown as Model<UserDocument>, 'deleteMany');

    service.removeMany([id1, id2]);

    expect(deleteManySpy).toHaveBeenCalled();
  });
});
