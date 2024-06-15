import { Injectable } from '@nestjs/common';
import { PaginationPayload } from '../../../infrastructure/pagination/types/pagination.types';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import { UserOutputModel } from '../api/models/output/user.output.model';
import { UsersQueryRepository } from './abstract-users-query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRowSqlRepository implements UsersQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly paginationService: PaginationService,
  ) {}

  async findUsers(
    pagination: PaginationPayload<UserOutputModel>,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;

    const offset = this.paginationService.getSkip(pageNumber, pageSize);

    const foundedUsers = await this.dataSource.query(
      `
    SELECT *
    FROM public."Users" u
    WHERE LOWER(login) LIKE LOWER('%' || $1 || '%') 
      OR LOWER(email) LIKE LOWER('%' || $2 || '%')
        ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}
    LIMIT $3 OFFSET $4;
  `,
      [searchLoginTerm || '', searchEmailTerm || '', pageSize, offset],
    );

    const totalCount = +(
      await this.dataSource.query(
        `
    SELECT COUNT(*) AS "totalCount"
    FROM public."Users"
    WHERE LOWER(login) LIKE LOWER('%' || $1 || '%') 
      OR LOWER(email) LIKE LOWER('%' || $2 || '%')
  `,
        [searchLoginTerm || '', searchEmailTerm || ''],
      )
    )[0].totalCount;

    const viewUsers = foundedUsers.map((u) => {
      return {
        id: u._id,
        login: u.login,
        email: u.email,
        createdAt: u.createdAt,
      };
    });

    return this.paginationService.createPaginationResponse<UserOutputModel>(
      pagination,
      viewUsers,
      totalCount,
    );
  }

  async findUserById(id: string): Promise<UserOutputModel | null> {
    const foundUser = (
      await this.dataSource.query(
        `
    SELECT u.* 
    FROM public."Users" as u
    WHERE u._id = $1
    `,
        [id],
      )
    )[0];

    if (!foundUser) {
      return null;
    }

    const viewUserModel: UserOutputModel = {
      id: foundUser._id,
      login: foundUser.login,
      email: foundUser.email,
      createdAt: foundUser.createdAt,
    };

    return viewUserModel;
  }
}
