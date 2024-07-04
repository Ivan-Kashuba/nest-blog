import { Session, TSessionDocument } from '../domain/Session.entity';
import { Types } from 'mongoose';

export interface AuthRepository {
  addUserSession(userSession: Session): Promise<boolean>;

  getUserSessionsList(
    userId: Types.ObjectId | string,
  ): Promise<TSessionDocument[] | null>;

  removeUserSession(sessionId: Types.ObjectId | string): Promise<boolean>;

  updateUserSessionLastActiveDate(
    sessionId: Types.ObjectId | string,
    lastActiveDate: string,
  ): Promise<void>;

  removeAllButCurrentUserSession(
    userId: Types.ObjectId | string,
    currentSessionId: Types.ObjectId | string,
  ): Promise<boolean>;

  getSessionByDeviceId(
    deviceId: Types.ObjectId | string,
  ): Promise<TSessionDocument | null>;

  save(session: TSessionDocument): Promise<void>;
}
