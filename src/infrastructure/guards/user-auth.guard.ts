import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../application/jwt.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.split(' ')[1];

    if (!bearerToken) {
      throw new UnauthorizedException();
    }

    const userInfo = await this.jwtService.getUserInfoByToken(bearerToken);

    if (!userInfo?.userId) {
      throw new UnauthorizedException();
    }

    request.user = userInfo!;

    return true;
  }
}
