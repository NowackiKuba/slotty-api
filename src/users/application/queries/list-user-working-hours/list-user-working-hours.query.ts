import { Query } from '@common/application/cqrs';
import type { UserWorkingHoursReadModel } from '@users/application/read-models';

export type ListUserWorkingHoursQueryPayload = {
  userId: string;
};

export class ListUserWorkingHoursQuery extends Query<
  ListUserWorkingHoursQueryPayload,
  UserWorkingHoursReadModel[]
> {
  constructor(payload: ListUserWorkingHoursQueryPayload) {
    super(payload);
  }
}
