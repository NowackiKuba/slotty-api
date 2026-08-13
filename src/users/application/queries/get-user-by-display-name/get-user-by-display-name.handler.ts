import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { GetUserByDisplayNameQuery } from './get-user-by-display-name.query';

@QueryHandler(GetUserByDisplayNameQuery)
export class GetUserByDisplayNameHandler implements IQueryHandler<
  GetUserByDisplayNameQuery,
  UserReadModel
> {
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByDisplayNameQuery): Promise<UserReadModel> {
    const { displayName } = query.payload;
    const user = await this.userRepository.findByDisplayName(displayName);

    if (!user) {
      throw new UserNotFoundException(displayName);
    }

    return this.mapper.toReadModel(user);
  }
}
