import { Injectable } from '@nestjs/common';
import { TUserDocument, TUserModel, User } from '../domain/User.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UsersRepository } from './abstract-users.repository';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserCreateModel } from '../api/models/input/create-user.input.model';

@Injectable()
export class UsersRowSqlRepository implements UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: TUserModel,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<TUserDocument | null> {
    const foundUser = await this.dataSource.query(
      `
    SELECT u.*, 
    uc."confirmationCode" as "activateConfirmationCode",
    uc."isConfirmed" as "isActivationConfirmed", 
    uc."expirationDate" as "activationExpirationDate",
    upr."confirmationCode" as "passwordRecoveryConfirmationCode",
    upr."expirationDate" as "passwordRecoveryExpirationDate"
    FROM public."Users" as u
    LEFT JOIN public."UsersConfirmation" as uc
    ON u."_id" = uc."userId"
    LEFT JOIN public."UsersPasswordRecovery" as upr
    ON u."_id" = upr."userId"
    WHERE u.login = $1 OR u.email = $1
    `,
      [loginOrEmail],
    );

    return foundUser[0] as TUserDocument;
  }

  async createUser(
    userPayload: UserCreateModel,
    salt: string,
    hash: string,
  ): Promise<string> {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const user = (
      await this.dataSource.query(
        `
    INSERT INTO public."Users"(
    _id, "createdAt", login, email, salt, hash)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *;
    `,
        [id, createdAt, userPayload.login, userPayload.email, salt, hash],
      )
    )[0];

    return user._id;
  }

  async findUserById(id: string): Promise<TUserDocument | null> {
    const user: TUserDocument | null = await this.UserModel.findOne({
      _id: new Types.ObjectId(id),
    });

    return user ? user : null;
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

  async deleteUser(userId: string) {
    const userRemoveInfo = await this.dataSource.query(
      `
    DELETE FROM public."Users" u
    WHERE u._id = $1
    `,
      [userId],
    );

    const [_, deleteCount] = userRemoveInfo;

    return deleteCount === 1;
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
