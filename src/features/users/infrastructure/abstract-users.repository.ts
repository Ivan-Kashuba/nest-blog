import { TUserDocument, User } from '../domain/User.entity';
import { Types } from 'mongoose';

export interface UsersRepository {
  findUserByLoginOrEmail(loginOrEmail: string): Promise<TUserDocument | null>;

  findUserById(userId: Types.ObjectId): Promise<TUserDocument | null>;

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
