import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from '../../config/env-config';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const ADMIN_AUTH_HEADER = this.configService.get(
      EnvVariables.ADMIN_AUTH_HEADER,
    );

    if (request.headers.authorization !== ADMIN_AUTH_HEADER) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
