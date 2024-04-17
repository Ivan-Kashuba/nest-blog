import jwt, { SignOptions } from 'jsonwebtoken';
import { MILLI_SECONDS_IN_SECOND } from '../shared/constants';
import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { envConfig } from '../config/env-config';
import { UserTokenInfo } from '../features/auth/types/auth.types';

@Injectable()
export class JwtService {
  async createJwt(
    userInfo: UserTokenInfo,
    expiresIn: SignOptions['expiresIn'],
  ) {
    return jwt.sign(
      {
        userId: userInfo.userId,
        email: userInfo.email,
        login: userInfo.login,
        deviceId: userInfo.deviceId,
      } as UserTokenInfo,
      envConfig.JWT_SECRET_KEY,
      {
        expiresIn,
      },
    );
  }

  async getUserInfoByToken(token: string) {
    try {
      const result = jwt.verify(
        token,
        envConfig.JWT_SECRET_KEY,
      ) as UserTokenInfo;

      return {
        userId: result.userId,
        email: result.email,
        login: result.login,
        deviceId: result.deviceId,
      } as UserTokenInfo;
    } catch (err) {
      return null;
    }
  }

  async getJwtExpirationDate(token: string) {
    const payload: any = jwt.decode(token);

    if (!payload) {
      return null;
    }

    return new Date(payload.exp * MILLI_SECONDS_IN_SECOND).toISOString();
  }

  createSalt(rounds: number) {
    return bcrypt.genSaltSync(rounds);
  }

  createHash(data: string, salt: string) {
    return bcrypt.hashSync(data, salt);
  }
}
