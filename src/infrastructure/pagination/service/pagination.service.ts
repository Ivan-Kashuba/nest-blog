import {
  PaginationPayload,
  SortDirection,
  WithPagination,
} from '../types/pagination.types';

export class PaginationService {
  DEFAULT_PAGE_SIZE = 10;
  DEFAULT_SORT_DIRECTION: SortDirection = 'desc';
  DEFAULT_PAGE_NUMBER = 1;
  DEFAULT_PAGINATION_PAYLOAD = this.getDefaultPaginationPayload();

  createPaginationResponse<T>(
    pagination: PaginationPayload<T>,
    items: T[],
    totalCount: number,
  ): WithPagination<T> {
    const { pageSize, pageNumber } = pagination;

    const pagesCount = Math.ceil(totalCount / pageSize);

    return { pageSize, page: pageNumber, pagesCount, totalCount, items };
  }

  getSkip = (pageNumber: number, pageSize: number) => {
    return (pageNumber - 1) * pageSize;
  };

  getSortDirectionMongoValue = (sortValue: SortDirection) => {
    if (sortValue === 'asc') {
      return 1;
    } else {
      return -1;
    }
  };

  validatePayloadPagination<T = { createdAt: string }>(
    paginationFromRequest: Partial<PaginationPayload<T>>,
    defaultSortBy: keyof T,
  ) {
    const { sortDirection, sortBy, pageSize, pageNumber } =
      paginationFromRequest;

    return {
      pageSize: !isNaN(pageSize!)
        ? +pageSize!
        : this.DEFAULT_PAGINATION_PAYLOAD.pageSize,
      pageNumber: !isNaN(pageNumber!)
        ? +pageNumber!
        : this.DEFAULT_PAGINATION_PAYLOAD.pageNumber,
      sortBy: sortBy ? sortBy : defaultSortBy,
      sortDirection:
        sortDirection === 'asc' || sortDirection === 'desc'
          ? sortDirection
          : this.DEFAULT_PAGINATION_PAYLOAD.sortDirection,
    };
  }

  getDefaultPaginationPayload(): PaginationPayload<any> {
    return {
      pageSize: this.DEFAULT_PAGE_SIZE,
      sortDirection: this.DEFAULT_SORT_DIRECTION,
      pageNumber: this.DEFAULT_PAGE_NUMBER,
      sortBy: '',
    };
  }

  getInsensitiveCaseSearchRegexString = (string: string) => {
    return new RegExp(`.*${string}.*`, 'i');
  };
}
