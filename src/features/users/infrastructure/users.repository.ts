import { Injectable } from '@nestjs/common';
import { TUserDocument, TUserModel, User } from '../domain/User.entity';
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

  async findUserById(userId: string): Promise<TUserModel | null> {
    return this.UserModel.findOne({ id: userId });
  }

  async deleteUser(userId: string) {
    const deletedResponse = await this.UserModel.deleteOne({ _id: userId });

    return deletedResponse.deletedCount === 1;
  }

  async save(user: TUserDocument) {
    await user.save();
  }
}
