import { TUserDocument, User } from '../domain/User.entity';
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

  updateUserByLoginOrEmail(
    loginOrEmail: string,
    updateInfo: Partial<User>,
  ): Promise<TUserDocument | null>;

  deleteUser(userId: string): Promise<boolean>;

  findUserByPasswordRecoveryCode(code: string): Promise<TUserDocument | null>;

  save(user: TUserDocument): Promise<void>;
}
