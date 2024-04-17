import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '../../application/jwt.service';

@Injectable()
export class UserInfoFromTokenIfExists implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      const userInfo = await this.jwtService.getUserInfoByToken(token!);
      if (userInfo) {
        req.user = userInfo!;
      }
    }

    next();
  }
}
