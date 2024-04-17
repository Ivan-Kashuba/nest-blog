import { UserTokenInfo } from '../../features/auth/types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenInfo;
      extraString?: string;
      otherArguments?: int;
    }
  }
}
