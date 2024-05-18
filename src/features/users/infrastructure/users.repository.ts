import { Injectable } from '@nestjs/common';
import { TUserDocument, TUserModel, User } from '../domain/User.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: TUserModel) {}

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  async findUserById(userId: Types.ObjectId): Promise<TUserModel | null> {
    return this.UserModel.findOne({ _id: userId });
  }

  async findUserByRegistrationActivationCode(code: string) {
    return this.UserModel.findOne({
      'accountConfirmation.confirmationCode': code,
    });
  }

  async updateUserByLoginOrEmail(
    loginOrEmail: string,
    updateInfo: Partial<User>,
  ) {
    return this.UserModel.findOneAndUpdate(
      {
        $or: [
          { 'accountData.login': loginOrEmail },
          { 'accountData.email': loginOrEmail },
        ],
      },
      {
        $set: {
          ...updateInfo,
        },
      },
    );
  }

  async deleteUser(userId: string) {
    const deletedResponse = await this.UserModel.deleteOne({ _id: userId });

    return deletedResponse.deletedCount === 1;
  }

  async findUserByPasswordRecoveryCode(code: string) {
    return this.UserModel.findOne({
      'passwordRecovery.confirmationCode': code,
    }).lean();
  }

  async save(user: TUserDocument) {
    await user.save();
  }
}
