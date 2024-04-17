import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { JwtService } from '../../../application/jwt.service';
import { Types } from 'mongoose';
import { UserTokenInfo } from '../types/auth.types';
import { LoginInputModel } from '../api/models/input/login.input.model';
import { AuthRepository } from '../infrastructure/auth.repository';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { TUserModel, User } from '../../users/domain/User.entity';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { EmailManager } from '../../../adapters/email.manager';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    protected readonly jwtService: JwtService,
    protected readonly emailManager: EmailManager,
    @InjectModel(User.name) private UserModel: TUserModel,
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

    const deviceId = new Types.ObjectId();

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
      deviceId: deviceId,
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

    await this.emailManager.sendRegistrationConfirmEmail(
      userInfo.email,
      confirmationCode,
    );

    await this.usersRepository.save(userInDb);

    return userInDb._id;
  }

  async createJwtKeys(userInfo: UserTokenInfo) {
    const accessToken = await this.jwtService.createJwt(userInfo, '6m');
    const refreshToken = await this.jwtService.createJwt(userInfo, '30d');

    return {
      accessToken,
      refreshToken,
    };
  }
}
