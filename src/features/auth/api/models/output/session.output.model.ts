import { Session, TSessionDocument } from '../../../domain/Session.entity';
import { Types } from 'mongoose';

export class DeviceSessionOutputModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: Types.ObjectId;
}

export const SessionOutputModelMapper = (
  session: Session | TSessionDocument,
): DeviceSessionOutputModel => {
  const outputModel = new DeviceSessionOutputModel();

  outputModel.ip = session.ip;
  outputModel.deviceId = session.deviceId;
  outputModel.title = session.title;
  outputModel.lastActiveDate = session.lastActiveDate;

  return outputModel;
};
