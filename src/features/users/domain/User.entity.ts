import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserCreateModel } from '../api/models/input/create-user.input.model';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../infrastructure/users.repository';

@Schema({ _id: false, timestamps: { createdAt: true } })
export class UserAccountData {
  createdAt: string;
  @Prop({ required: true, type: String })
  login: string;
  @Prop({ required: true, type: String })
  email: string;
  @Prop({ required: true, type: String })
  salt: string;
  @Prop({ required: true, type: String })
  hash: string;
}

@Schema({ _id: false })
export class UserAccountConfirmation {
  @Prop({ type: String || null })
  confirmationCode: string | null;
  @Prop({ type: String || null })
  expirationDate: string | null;
  @Prop({ required: true, type: Boolean })
  isConfirmed: boolean;
}

@Schema({ _id: false })
export class UserPasswordRecovery {
  @Prop({ type: String || null })
  confirmationCode: string | null;
  @Prop({ type: String || null })
  expirationDate: string | null;
}

@Schema()
export class User {
  _id: Types.ObjectId;
  @Prop(UserAccountData)
  accountData: UserAccountData;
  @Prop(UserAccountConfirmation)
  accountConfirmation: UserAccountConfirmation;
  @Prop(UserPasswordRecovery)
  passwordRecovery: UserPasswordRecovery;

  static async createUser(
    UserModel: TUserModel,
    usersRepository: UsersRepository,
    userPayload: UserCreateModel,
  ): Promise<TUserDocument | null> {
    const { login, password, email } = userPayload;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const isLoginExists = await usersRepository.findUserByLoginOrEmail(login);
    const isEmailExists = await usersRepository.findUserByLoginOrEmail(email);

    if (isLoginExists || isEmailExists) {
      throw new Error('User credentials are already in use');
    }

    const userToSave: User = {
      _id: new Types.ObjectId(),
      accountData: {
        login,
        email,
        hash,
        salt,
        createdAt: new Date().toISOString(),
      },
      accountConfirmation: {
        confirmationCode: null,
        isConfirmed: true,
        expirationDate: null,
      },
      passwordRecovery: {
        confirmationCode: null,
        expirationDate: null,
      },
    };

    return new UserModel(userToSave);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.statics = {
  createUser: User.createUser,
};

export type TUserStaticMethods = {
  createUser: (
    usersModelClass: TUserModel,
    usersRepository: UsersRepository,
    userPayload: UserCreateModel,
  ) => Promise<TUserDocument>;
};

export type TUserDocument = HydratedDocument<User>;
export type TUserModel = Model<User> & TUserStaticMethods;
