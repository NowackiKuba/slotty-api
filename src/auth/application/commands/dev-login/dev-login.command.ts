import { Command } from '@common/application/cqrs';

export type DevLoginCommandPayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export class DevLoginCommand extends Command<DevLoginCommandPayload> {
  constructor(payload: DevLoginCommandPayload) {
    super(payload);
  }
}
