import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  DeviceSessionOutputModel,
  SessionOutputModelMapper,
} from '../api/models/output/session.output.model';
import { SecurityQueryRepository } from './abstract-security-query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityRowSqlQueryRepository implements SecurityQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getUserSessionsListById(
    userId: Types.ObjectId,
  ): Promise<DeviceSessionOutputModel[]> {
    const dbUserSessions = await this.dataSource.query(
      `
     SELECT *
        FROM public."Sessions" s
        WHERE s."userId" = $1
    `,
      [userId],
    );

    return dbUserSessions.map((session) => SessionOutputModelMapper(session));
  }
}
