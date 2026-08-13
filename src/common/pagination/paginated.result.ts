import type { PaginationInput } from './pagination.query';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export class PaginatedResult<T> {
  readonly data: T[];
  readonly meta: PaginationMeta;

  private constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }

  static create<T>(
    data: T[],
    total: number,
    query: Pick<PaginationInput, 'page' | 'limit'>,
  ): PaginatedResult<T> {
    const page = query.page;
    const limit = query.limit;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return new PaginatedResult(data, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    });
  }
}
