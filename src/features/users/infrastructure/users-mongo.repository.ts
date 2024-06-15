import { Injectable } from '@nestjs/common';
import { TUserDocument, TUserModel, User } from '../domain/User.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UsersRepository } from './abstract-users.repository';
import { UserCreateModel } from '../api/models/input/create-user.input.model';

@Injectable()
export class UsersMongoRepository implements UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: TUserModel) {}

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<TUserDocument | null> {
    return this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  async createUser(
    userPayload: UserCreateModel,
    salt: string,
    hash: string,
  ): Promise<Types.ObjectId> {
    const user: TUserDocument | null = await this.UserModel.createUser(
      userPayload,
      salt,
      hash,
    );

    if (user) {
      await this.save(user);
    }

    return user!._id;
  }

  async findUserById(userId: string): Promise<TUserDocument | null> {
    return this.UserModel.findOne({ _id: new Types.ObjectId(userId) });
  }

  async findUserByRegistrationActivationCode(
    code: string,
  ): Promise<TUserDocument | null> {
    return this.UserModel.findOne({
      'accountConfirmation.confirmationCode': code,
    });
  }

  async updateUserByLoginOrEmail(
    loginOrEmail: string,
    updateInfo: Partial<User>,
  ): Promise<TUserDocument | null> {
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

  async deleteUser(userId: string): Promise<boolean> {
    const deletedResponse = await this.UserModel.deleteOne({ _id: userId });

    return deletedResponse.deletedCount === 1;
  }

  async findUserByPasswordRecoveryCode(
    code: string,
  ): Promise<TUserDocument | null> {
    return this.UserModel.findOne({
      'passwordRecovery.confirmationCode': code,
    }).lean();
  }

  async save(user: TUserDocument) {
    await user.save();
  }
}
