import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  Session,
  TSessionDocument,
  TSessionModel,
} from '../domain/Session.entity';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(Session.name) private SessionModel: TSessionModel) {}

  async addUserSession(userSession: Session) {
    const { _id } = await this.SessionModel.create(userSession);

    return !!_id;
  }

  async save(post: TSessionDocument) {
    await post.save();
  }
}
