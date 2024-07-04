import { Injectable } from '@nestjs/common';
import {
  TUserDocument,
  User,
  UserAccountConfirmation,
} from '../domain/User.entity';
import { UsersRepository } from './abstract-users.repository';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { Types } from 'mongoose';

@Injectable()
export class UsersRowSqlRepository implements UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async _getUserByCondition(queryString: string) {
    const foundUser = (
      await this.dataSource.query(
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
    ${queryString}
    `,
      )
    )[0];

    if (!foundUser) return null;

    return {
      _id: foundUser._id,
      accountData: {
        login: foundUser.login,
        email: foundUser.email,
        hash: foundUser.hash,
        salt: foundUser.salt,
        createdAt: foundUser.createdAt,
      },
      accountConfirmation: {
        confirmationCode: foundUser.activateConfirmationCode,
        isConfirmed: foundUser.isActivationConfirmed,
        expirationDate: foundUser.activationExpirationDate,
      },
      passwordRecovery: {
        confirmationCode: foundUser.passwordRecoveryConfirmationCode,
        expirationDate: foundUser.passwordRecoveryExpirationDate,
      },
    } as TUserDocument;
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<TUserDocument | null> {
    return await this._getUserByCondition(
      `WHERE u.login = '${loginOrEmail}' OR u.email = '${loginOrEmail}'`,
    );
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

    await this.dataSource.query(
      `
    INSERT INTO public."UsersConfirmation"(
"userId", "isConfirmed")
VALUES ($1,$2)
    `,
      [user._id, true],
    );

    return user._id;
  }

  async findUserById(id: string): Promise<TUserDocument | null> {
    return await this._getUserByCondition(`WHERE u._id = '${id}'`);
  }

  async findUserByRegistrationActivationCode(
    code: string,
  ): Promise<TUserDocument | null> {
    return await this._getUserByCondition(
      `WHERE uc."confirmationCode" = '${code}'`,
    );
  }

  async confirmUserAccountById(id: string): Promise<void> {
    await this.dataSource.query(
      `
    UPDATE public."UsersConfirmation" uc
    SET "confirmationCode"=null, "expirationDate"=null, "isConfirmed"=true
    WHERE uc."userId"=$1
    `,
      [id],
    );
  }

  async createPasswordRecoveryCode(
    userId: string,
    code: string,
    expirationDate: string,
  ) {
    await this.dataSource.query(
      `
    UPDATE public."UsersPasswordRecovery" upr
    SET "confirmationCode"=$2, "expirationDate"=$3
    WHERE upr."userId"=$1
    `,
      [userId, code, expirationDate],
    );
  }

  async updateUserPassword(userId: string, salt: string, hash: string) {
    await this.dataSource.query(
      `
    UPDATE public."Users" u
    SET "salt"=$2, "hash"=$3
    WHERE u."_id"=$1
    `,
      [userId, salt, hash],
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
    return await this._getUserByCondition(
      `WHERE upr."confirmationCode" = '${code}'`,
    );
  }

  async registerUser(user: TUserDocument): Promise<Types.ObjectId | string> {
    const {
      accountData: { createdAt, hash, email, login, salt },
      accountConfirmation: { confirmationCode, isConfirmed, expirationDate },
      passwordRecovery: {
        confirmationCode: recoveryCode,
        expirationDate: recoveryExpirationDate,
      },
    } = user;

    const userId = uuidv4();

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO public."Users"(
        _id, "createdAt", login, email, salt, hash)
        VALUES ($1, $2, $3, $4, $5, $6);`,
        [userId, createdAt, login, email, salt, hash],
      );

      await manager.query(
        `INSERT INTO public."UsersConfirmation"(
        "userId", "confirmationCode", "expirationDate", "isConfirmed")
        VALUES ($1, $2, $3, $4);`,
        [userId, confirmationCode, expirationDate, isConfirmed],
      );

      await manager.query(
        `INSERT INTO public."UsersPasswordRecovery"(
        "userId", "confirmationCode", "expirationDate")
        VALUES ($1, $2, $3);`,
        [userId, recoveryCode, recoveryExpirationDate],
      );
    });

    return userId;
  }

  async updateUserAccountConfirmation(
    userId: string,
    accountConfirmationInfo: UserAccountConfirmation,
  ): Promise<void> {
    const { isConfirmed, confirmationCode, expirationDate } =
      accountConfirmationInfo;

    return await this.dataSource.query(
      `
    UPDATE public."UsersConfirmation" u
    SET "isConfirmed"=$2, "confirmationCode"=$3, "expirationDate"=$4
    WHERE u."userId"=$1
    `,
      [userId, isConfirmed, confirmationCode, expirationDate],
    );
  }

  async save(user: TUserDocument) {
    await user.save();
  }
}
