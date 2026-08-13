import { Command } from '@common/application/cqrs';

export type SocialLoginCommandPayload = {
  provider: 'google' | 'apple';
  idToken: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export class SocialLoginCommand extends Command<SocialLoginCommandPayload> {
  constructor(payload: SocialLoginCommandPayload) {
    super(payload);
  }
}
