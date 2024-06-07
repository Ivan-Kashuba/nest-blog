import jwt, { SignOptions } from 'jsonwebtoken';
import { MILLI_SECONDS_IN_SECOND } from '../shared/constants';
import bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { UserTokenInfo } from '../features/auth/types/auth.types';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from '../config/env-config';

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}
  async createJwt(
    userInfo: UserTokenInfo,
    expiresIn: SignOptions['expiresIn'],
  ) {
    const JWT_SECRET_KEY = this.configService.get(EnvVariables.JWT_SECRET_KEY);

    return jwt.sign(
      {
        userId: userInfo.userId,
        email: userInfo.email,
        login: userInfo.login,
        deviceId: userInfo.deviceId,
      } as UserTokenInfo,
      JWT_SECRET_KEY,
      {
        expiresIn,
      },
    );
  }

  async getUserInfoByToken(token: string) {
    const JWT_SECRET_KEY = this.configService.get(EnvVariables.JWT_SECRET_KEY);

    try {
      const result = jwt.verify(token, JWT_SECRET_KEY) as UserTokenInfo;

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
