import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserCreateModel } from '../api/models/input/create-user.input.model';

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
    userPayload: UserCreateModel,
    salt: string,
    hash: string,
  ): Promise<TUserDocument | null> {
    const that = this as unknown as TUserModel;
    const { login, email } = userPayload;

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

    return new that(userToSave);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

const UserStaticMethods = {
  createUser: User.createUser,
};

UserSchema.statics = UserStaticMethods;

export type TUserStaticMethods = typeof UserStaticMethods;
export type TUserDocument = HydratedDocument<User>;
export type TUserModel = Model<User> & TUserStaticMethods;
