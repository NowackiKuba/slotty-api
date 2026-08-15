import { Command } from '@common/application/cqrs';
import type { PaymentDetailsProps } from '@users/domain/types';

export type ChangeUserProfilePaymentsCommandPayload = {
  userId: string;
  settlementType?: string;
  paymentMethods?: string[];
  paymentDetails?: PaymentDetailsProps | null;
  cancellationWindowHours?: number | null;
};

export class ChangeUserProfilePaymentsCommand extends Command<ChangeUserProfilePaymentsCommandPayload> {
  constructor(payload: ChangeUserProfilePaymentsCommandPayload) {
    super(payload);
  }
}
