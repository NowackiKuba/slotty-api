import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserWorkingHoursReadModelMapper } from '@users/application/mappers';
import type { UserWorkingHoursReadModel } from '@users/application/read-models';
import { upsertUserWorkingHours } from '@users/application/upsert-user-working-hours';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type {
  IUserRepository,
  IUserWorkingHoursRepository,
} from '@users/domain/repositories';
import {
  USER_REPOSITORY,
  USER_WORKING_HOURS_REPOSITORY,
} from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { SetUserWorkingHoursDayCommand } from './set-user-working-hours-day.command';

@CommandHandler(SetUserWorkingHoursDayCommand)
export class SetUserWorkingHoursDayHandler implements ICommandHandler<
  SetUserWorkingHoursDayCommand,
  UserWorkingHoursReadModel
> {
  constructor(
    private readonly mapper: UserWorkingHoursReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_WORKING_HOURS_REPOSITORY)
    private readonly workingHoursRepository: IUserWorkingHoursRepository,
  ) {}

  async execute(
    command: SetUserWorkingHoursDayCommand,
  ): Promise<UserWorkingHoursReadModel> {
    const { userId } = command.payload;
    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const workingHours = await upsertUserWorkingHours(
      this.workingHoursRepository,
      command.payload,
    );

    return this.mapper.toReadModel(workingHours);
  }
}
