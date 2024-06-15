import {
  PaginationPayload,
  WithPagination,
} from '../../../infrastructure/pagination/types/pagination.types';
import { UserOutputModel } from '../api/models/output/user.output.model';

export interface UsersQueryRepository {
  findUsers(
    pagination: PaginationPayload<UserOutputModel>,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ): Promise<WithPagination<UserOutputModel>>;

  findUserById(id: string): Promise<UserOutputModel | null>;
}
