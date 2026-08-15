import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { UserWorkingHoursReadModelMapper } from '@users/application/mappers';
import type { UserWorkingHoursReadModel } from '@users/application/read-models';
import type { IUserWorkingHoursRepository } from '@users/domain/repositories';
import { USER_WORKING_HOURS_REPOSITORY } from '@users/domain/tokens';
import { ListUserWorkingHoursQuery } from './list-user-working-hours.query';

@QueryHandler(ListUserWorkingHoursQuery)
export class ListUserWorkingHoursHandler implements IQueryHandler<
  ListUserWorkingHoursQuery,
  UserWorkingHoursReadModel[]
> {
  constructor(
    private readonly mapper: UserWorkingHoursReadModelMapper,
    @Inject(USER_WORKING_HOURS_REPOSITORY)
    private readonly workingHoursRepository: IUserWorkingHoursRepository,
  ) {}

  async execute(
    query: ListUserWorkingHoursQuery,
  ): Promise<UserWorkingHoursReadModel[]> {
    const workingHours = await this.workingHoursRepository.listByUserId(
      query.payload.userId,
    );

    return workingHours.map((row) => this.mapper.toReadModel(row));
  }
}
