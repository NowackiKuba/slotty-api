import { Command } from '@common/application/cqrs';
import type { LocationPointProps } from '@users/domain/types';

export type ChangeUserProfileLocationsCommandPayload = {
  userId: string;
  places?: LocationPointProps[];
  withTravel?: boolean;
};

export class ChangeUserProfileLocationsCommand extends Command<ChangeUserProfileLocationsCommandPayload> {
  constructor(payload: ChangeUserProfileLocationsCommandPayload) {
    super(payload);
  }
}
