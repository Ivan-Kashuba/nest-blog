import { Injectable } from '@nestjs/common';
import { Session, TSessionDocument } from '../domain/Session.entity';
import { AuthRepository } from './abstract-auth.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthRowSqlRepository implements AuthRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async addUserSession(userSession: Session): Promise<boolean> {
    const { ip, title, lastActiveDate, userId, deviceId } = userSession;

    try {
      await this.dataSource.query(
        `
      INSERT INTO public."Sessions"(
        _id, ip, title, "lastActiveDate", "deviceId", "userId")
        VALUES ($1, $2, $3, $4, $5, $6);
    `,
        [uuidv4(), ip, title, lastActiveDate, deviceId, userId],
      );

      return true;
    } catch {
      return false;
    }
  }

  async getUserSessionsList(
    userId: string,
  ): Promise<TSessionDocument[] | null> {
    const response = await this.dataSource.query(
      `
     SELECT *
        FROM public."Sessions" s
        WHERE s."userId" = $1
    `,
      [userId],
    );

    return (response as TSessionDocument[]) || null;
  }

  async removeUserSession(sessionId: string): Promise<boolean> {
    try {
      const sessionRemoveInfo = await this.dataSource.query(
        `
     DELETE FROM public."Sessions" s
        WHERE s._id = $1
    `,
        [sessionId],
      );

      const [_, deleteCount] = sessionRemoveInfo;

      return deleteCount === 1;
    } catch {
      return false;
    }
  }

  async updateUserSessionLastActiveDate(
    sessionId: string,
    lastActiveDate: string,
  ): Promise<void> {
    return await this.dataSource.query(
      `
   UPDATE public."Sessions" s
    SET "lastActiveDate" = $2
    WHERE s._id = $1;
    `,
      [sessionId, lastActiveDate],
    );
  }

  async removeAllButCurrentUserSession(
    userId: string,
    currentSessionId: string,
  ): Promise<boolean> {
    try {
      await this.dataSource.query(
        `
     DELETE FROM public."Sessions" s
        WHERE s."_id" != $2 AND s."userId" = $1
    `,
        [userId, currentSessionId],
      );

      return true;
    } catch {
      return false;
    }
  }

  async getSessionByDeviceId(
    deviceId: string,
  ): Promise<TSessionDocument | null> {
    return (
      await this.dataSource.query(
        `
     SELECT *
        FROM public."Sessions" s
        WHERE s."deviceId" = $1
    `,
        [deviceId],
      )
    )[0] as TSessionDocument;
  }

  async save(session: TSessionDocument): Promise<void> {
    await session.save();
  }
}
