import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Session, TSessionModel } from '../domain/Session.entity';
import { Types } from 'mongoose';
import {
  DeviceSessionOutputModel,
  SessionOutputModelMapper,
} from '../api/models/output/session.output.model';
import { SecurityQueryRepository } from './abstract-security-query.repository';

@Injectable()
export class SecurityMongoQueryRepository implements SecurityQueryRepository {
  constructor(@InjectModel(Session.name) private SessionModel: TSessionModel) {}
  async getUserSessionsListById(
    userId: Types.ObjectId,
  ): Promise<DeviceSessionOutputModel[]> {
    const dbUserSessions = await this.SessionModel.find({
      userId: new Types.ObjectId(userId),
    });

    return dbUserSessions.map((session) => SessionOutputModelMapper(session));
  }
}
