import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  TSessionDocument,
  TSessionModel,
} from '../domain/Session.entity';
import { Types } from 'mongoose';

@Injectable()
export class AuthMongoRepository {
  constructor(@InjectModel(Session.name) private SessionModel: TSessionModel) {}

  async addUserSession(userSession: Session) {
    const { _id } = await this.SessionModel.create(userSession);

    return !!_id;
  }

  async getUserSessionsList(userId: Types.ObjectId) {
    return this.SessionModel.find({ userId: new Types.ObjectId(userId) });
  }

  async removeUserSession(sessionId: Types.ObjectId) {
    const { deletedCount } = await this.SessionModel.deleteOne({
      _id: new Types.ObjectId(sessionId),
    });

    return deletedCount === 1;
  }

  async updateUserDeviceSession(
    sessionId: Types.ObjectId,
    sessionToUpdate: Partial<Session>,
  ) {
    return this.SessionModel.findOneAndUpdate(
      { _id: sessionId },
      { $set: sessionToUpdate },
    );
  }

  async removeAllButCurrentUserSession(
    userId: Types.ObjectId,
    currentSessionId: Types.ObjectId,
  ) {
    const deleteResult = await this.SessionModel.deleteMany({
      userId: new Types.ObjectId(userId),
      _id: { $ne: new Types.ObjectId(currentSessionId) },
    });
    return deleteResult.acknowledged;
  }

  async getSessionByDeviceId(deviceId: Types.ObjectId) {
    return this.SessionModel.findOne({
      deviceId: new Types.ObjectId(deviceId),
    });
  }

  async save(post: TSessionDocument) {
    await post.save();
  }
}
