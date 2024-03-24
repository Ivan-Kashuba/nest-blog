export type WithPagination<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

export type PaginationPayload<T> = {
  sortBy: keyof T;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
};

export type SortDirection = 'asc' | 'desc';
