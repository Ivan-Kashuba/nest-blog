import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserTokenInfo } from '../../../features/auth/types/auth.types';

export const User = createParamDecorator(
  (data: keyof UserTokenInfo, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user && user[data] : user;
  },
);
