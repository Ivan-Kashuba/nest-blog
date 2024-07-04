import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  TSessionDocument,
  TSessionModel,
} from '../domain/Session.entity';
import { Types } from 'mongoose';
import { AuthRepository } from './abstract-auth.repository';

@Injectable()
export class AuthMongoRepository implements AuthRepository {
  constructor(@InjectModel(Session.name) private SessionModel: TSessionModel) {}

  async addUserSession(userSession: Session): Promise<boolean> {
    const { _id } = await this.SessionModel.create(userSession);

    return !!_id;
  }

  async getUserSessionsList(
    userId: Types.ObjectId,
  ): Promise<TSessionDocument[] | null> {
    return this.SessionModel.find({
      userId: new Types.ObjectId(userId),
    });
  }

  async removeUserSession(sessionId: Types.ObjectId): Promise<boolean> {
    const { deletedCount } = await this.SessionModel.deleteOne({
      _id: new Types.ObjectId(sessionId),
    });

    return deletedCount === 1;
  }

  async updateUserSessionLastActiveDate(
    sessionId: Types.ObjectId,
    lastActiveDate: string,
  ): Promise<void> {
    await this.SessionModel.findOneAndUpdate(
      { _id: sessionId },
      { $set: { lastActiveDate } },
    );
  }

  async removeAllButCurrentUserSession(
    userId: Types.ObjectId,
    currentSessionId: Types.ObjectId,
  ): Promise<boolean> {
    const deleteResult = await this.SessionModel.deleteMany({
      userId: new Types.ObjectId(userId),
      _id: { $ne: new Types.ObjectId(currentSessionId) },
    });
    return deleteResult.acknowledged;
  }

  async getSessionByDeviceId(
    deviceId: Types.ObjectId,
  ): Promise<TSessionDocument | null> {
    return this.SessionModel.findOne({
      deviceId: new Types.ObjectId(deviceId),
    });
  }

  async save(session: TSessionDocument): Promise<void> {
    await session.save();
  }
}
