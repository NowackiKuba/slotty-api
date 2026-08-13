import { Inject } from '@nestjs/common';
import {
  QueryHandler,
  type IQueryHandler,
} from '@common/application/cqrs';
import { PaginatedResult } from '@common/pagination';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { ListUsersQuery } from './list-users.query';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler
  implements IQueryHandler<ListUsersQuery, PaginatedResult<UserReadModel>>
{
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: ListUsersQuery,
  ): Promise<PaginatedResult<UserReadModel>> {
    const result = await this.userRepository.findMany(query.payload);

    return PaginatedResult.create(
      result.data.map((user) => this.mapper.toReadModel(user)),
      result.meta.total,
      query.payload,
    );
  }
}
