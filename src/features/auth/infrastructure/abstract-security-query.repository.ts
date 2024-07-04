import { Types } from 'mongoose';
import { DeviceSessionOutputModel } from '../api/models/output/session.output.model';

export interface SecurityQueryRepository {
  getUserSessionsListById(
    userId: Types.ObjectId | string,
  ): Promise<DeviceSessionOutputModel[]>;
}
