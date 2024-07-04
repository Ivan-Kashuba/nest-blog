import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '../../../application/jwt.service';
import { Types } from 'mongoose';
import { UserTokenInfo } from '../types/auth.types';
import { LoginInputModel } from '../api/models/input/login.input.model';
import { add, isBefore } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import {
  TUserDocument,
  TUserModel,
  User,
} from '../../users/domain/User.entity';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { EmailManager } from '../../../adapters/email.manager';
import { InjectModel } from '@nestjs/mongoose';
import { ResultService } from '../../../infrastructure/resultService/ResultService';
import { UsersRepository } from '../../users/infrastructure/abstract-users.repository';
import {
  RepositoryName,
  RepositoryVariant,
} from '../../../config/repository-config';
import { AuthRepository } from '../infrastructure/abstract-auth.repository';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from '../../../config/env-config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(RepositoryName.UsersRepository)
    private readonly usersRepository: UsersRepository,
    @Inject(RepositoryName.AuthRepository)
    private readonly authRepository: AuthRepository,
    protected readonly jwtService: JwtService,
    protected readonly emailManager: EmailManager,
    @InjectModel(User.name) private UserModel: TUserModel,
    protected readonly configService: ConfigService,
  ) {}

  async loginByLoginOrEmail(
    credentials: LoginInputModel,
    userDeviceName: string,
    userIp: string,
  ) {
    const userByLoginOrEmail =
      await this.usersRepository.findUserByLoginOrEmail(
        credentials.loginOrEmail,
      );

    if (!userByLoginOrEmail) return null;
    if (!userByLoginOrEmail?.accountConfirmation?.isConfirmed) return null;
    if (
      this.jwtService.createHash(
        credentials.password,
        userByLoginOrEmail?.accountData.salt,
      ) !== userByLoginOrEmail.accountData.hash
    )
      return null;

    const deviceId =
      this.configService.get(EnvVariables.REPOSITORY) ===
      RepositoryVariant.Mongo
        ? new Types.ObjectId()
        : uuidv4();

    const userInfo: UserTokenInfo = {
      userId: userByLoginOrEmail._id,
      email: userByLoginOrEmail.accountData.email,
      login: userByLoginOrEmail.accountData.login,
      deviceId: deviceId,
    };

    const { refreshToken, accessToken } = await this.createJwtKeys(userInfo);

    const expirationTokenDate =
      await this.jwtService.getJwtExpirationDate(refreshToken);

    await this.authRepository.addUserSession({
      _id: new Types.ObjectId(),
      userId: userByLoginOrEmail._id,
      ip: userIp,
      title: userDeviceName,
      deviceId: deviceId as any,
      lastActiveDate: expirationTokenDate!,
    });

    return { refreshToken, accessToken };
  }

  async registerUser(userInfo: UserCreateModel) {
    const salt = this.jwtService.createSalt(10);
    const confirmationCode = uuidv4();

    const currentDate = new Date().toISOString();

    const userInDb = new this.UserModel({
      _id: new Types.ObjectId(),
      accountData: {
        login: userInfo.login,
        email: userInfo.email,
        createdAt: currentDate,
        salt: salt,
        hash: this.jwtService.createHash(userInfo.password, salt),
      },
      accountConfirmation: {
        isConfirmed: false,
        confirmationCode,
        expirationDate: add(currentDate, { hours: 24 }).toISOString(),
      },
      passwordRecovery: {
        expirationDate: null,
        confirmationCode: null,
      },
    });

    const userId = await this.usersRepository.registerUser(userInDb);

    this.emailManager
      .sendRegistrationConfirmEmail(userInfo.email, confirmationCode)
      .catch((err) => console.log('Email error' + err));

    return userId;
  }

  async resendRegistrationCode(userEmail: string) {
    const confirmationCode = uuidv4();

    const user = await this.usersRepository.findUserByLoginOrEmail(userEmail);

    if (!user || user.accountConfirmation.isConfirmed) {
      throw new BadRequestException(
        ResultService.createError('email', 'Not found email to confirm'),
      );
    }

    user.accountConfirmation = {
      confirmationCode,
      isConfirmed: false,
      expirationDate: add(new Date(), { hours: 24 }).toISOString(),
    };

    await this.usersRepository.updateUserAccountConfirmation(
      user._id,
      user.accountConfirmation,
    );

    this.emailManager
      .sendRegistrationConfirmEmail(userEmail, confirmationCode)
      .catch((err) => console.log('Email error' + err));

    return;
  }

  async confirmRegistrationCode(code: string) {
    const userToConfirm: TUserDocument | null =
      await this.usersRepository.findUserByRegistrationActivationCode(code);

    if (!userToConfirm) {
      throw new BadRequestException(
        ResultService.createError('code', 'Code to confirm was not found'),
      );
    }

    await this.usersRepository.confirmUserAccountById(userToConfirm._id);
  }

  async refreshToken(refreshToken: string) {
    const user = await this.jwtService.getUserInfoByToken(refreshToken);

    if (!user) {
      return null;
    }

    const session = await this.getUserSessionByIdAndRefreshToken(
      user.userId,
      refreshToken,
    );

    if (!session) {
      return null;
    }

    const newJwtKeysPair = await this.createJwtKeys(user);

    await this.updateUserDeviceSession(
      session._id,
      newJwtKeysPair.refreshToken,
    );

    return newJwtKeysPair;
  }

  async getUserSessionByIdAndRefreshToken(
    userId: Types.ObjectId,
    refreshToken: string,
  ) {
    const usersSessions = await this.authRepository.getUserSessionsList(userId);

    const user = await this.jwtService.getUserInfoByToken(refreshToken);
    const refreshTokenExpirationDate =
      await this.jwtService.getJwtExpirationDate(refreshToken);

    if (!refreshTokenExpirationDate) return null;

    const session = usersSessions?.find((us) => {
      return (
        us?.deviceId.toString() === user?.deviceId.toString() &&
        refreshTokenExpirationDate === us.lastActiveDate
      );
    });

    if (!session) return null;

    return session;
  }

  async updateUserDeviceSession(
    sessionId: Types.ObjectId,
    refreshToken: string,
  ) {
    const expirationTokenDate =
      await this.jwtService.getJwtExpirationDate(refreshToken);

    return await this.authRepository.updateUserSessionLastActiveDate(
      sessionId,
      expirationTokenDate!,
    );
  }

  async logout(refreshToken: string) {
    const user = await this.jwtService.getUserInfoByToken(refreshToken);

    if (!user) return false;

    const validSession = await this.getUserSessionByIdAndRefreshToken(
      user.userId,
      refreshToken,
    );

    if (!validSession) return false;

    const isSessionRemoved = await this.authRepository.removeUserSession(
      validSession._id,
    );

    return isSessionRemoved;
  }

  async recoveryPassword(email: string) {
    const confirmationCode = uuidv4();

    const user = await this.usersRepository.findUserByLoginOrEmail(email);

    if (!user) {
      return true;
    }

    await this.usersRepository.createPasswordRecoveryCode(
      user._id,
      confirmationCode,
      add(new Date(), { hours: 24 }).toISOString(),
    );

    this.emailManager
      .sendPasswordRecoveryEmail(email, confirmationCode)
      .catch((err) => console.log('Email error' + err));
  }

  async setNewPasswordForUserByCode(recoveryCode: string, newPassword: string) {
    const user =
      await this.usersRepository.findUserByPasswordRecoveryCode(recoveryCode);

    if (!user) return false;

    const expirationDate = user.passwordRecovery.expirationDate;

    if (!expirationDate) return false;

    const isCodeExpired = isBefore(expirationDate, new Date());

    if (isCodeExpired) return false;

    const salt = this.jwtService.createSalt(10);

    await this.usersRepository.updateUserPassword(
      user._id,
      salt,
      this.jwtService.createHash(newPassword, salt),
    );
  }

  async createJwtKeys(userInfo: UserTokenInfo) {
    const accessToken = await this.jwtService.createJwt(userInfo, '10s');
    const refreshToken = await this.jwtService.createJwt(userInfo, '20s');

    return {
      accessToken,
      refreshToken,
    };
  }
}
