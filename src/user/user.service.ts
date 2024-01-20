import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUser, User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    private readonly confService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: User): Promise<User> {
    const createdUser = new this.userModel(user);
    await createdUser.save();
    return new User(createdUser.toObject({ virtuals: true }));
  }

  async createAll(users: User[]): Promise<User[]> {
    const createdUsers = users.map((user) => new this.userModel(user));
    await this.userModel.bulkSave(createdUsers);
    return createdUsers.map(
      (user) => new User(user.toObject({ virtuals: true })),
    );
  }

  async findAll(): Promise<User[]> {
    return (await this.userModel.find().lean({ virtuals: true }).exec()).map(
      (user) => new User(user),
    );
  }

  async findOne(id: string): Promise<User> {
    return new User(
      await this.userModel.findById(id).lean({ virtuals: true }).exec(),
    );
  }

  async findOneByEmail(email: string): Promise<User> {
    return new User(
      await this.userModel
        .findOne({ email: email })
        .lean({ virtuals: true })
        .exec(),
    );
  }

  async update(id: string, user: UpdateUser) {
    await this.userModel.findByIdAndUpdate(id, user);
  }

  async remove(id: string) {
    await this.userModel.findByIdAndDelete(id);
  }

  async removeMany(ids: string[]) {
    await this.userModel.deleteMany({ _id: { $in: ids } });
  }
}
