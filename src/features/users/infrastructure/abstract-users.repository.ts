import {
  TUserDocument,
  User,
  UserAccountConfirmation,
} from '../domain/User.entity';
import { Types } from 'mongoose';
import { UserCreateModel } from '../api/models/input/create-user.input.model';

export interface UsersRepository {
  findUserByLoginOrEmail(loginOrEmail: string): Promise<TUserDocument | null>;

  createUser(
    userPayload: UserCreateModel,
    salt: string,
    hash: string,
  ): Promise<string | Types.ObjectId>;

  findUserById(userId: string): Promise<TUserDocument | null>;

  findUserByRegistrationActivationCode(
    code: string,
  ): Promise<TUserDocument | null>;

  confirmUserAccountById(id: string | Types.ObjectId): Promise<void>;

  createPasswordRecoveryCode(
    userId: string | Types.ObjectId,
    code: string,
    expirationDate: string,
  ): Promise<void>;

  updateUserPassword(
    userId: string | Types.ObjectId,
    salt: string,
    hash: string,
  ): Promise<void>;

  deleteUser(userId: string): Promise<boolean>;

  findUserByPasswordRecoveryCode(code: string): Promise<TUserDocument | null>;

  registerUser(user: TUserDocument): Promise<Types.ObjectId | string>;

  updateUserAccountConfirmation(
    userId: string | Types.ObjectId,
    accountConfirmationInfo: UserAccountConfirmation,
  ): Promise<void>;

  save(user: TUserDocument): Promise<void>;
}
