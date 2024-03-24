import { Injectable } from '@nestjs/common';
import { TUserDocument, TUserModel, User } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: TUserModel) {}

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    }).lean();
  }

  async findUserById(userId: string) {
    return this.UserModel.findOne({ id: userId });
  }

  async save(user: TUserDocument) {
    await user.save();
  }

  deleteUser(userId: string) {
    return 'Hello World! ' + userId;
  }
}
