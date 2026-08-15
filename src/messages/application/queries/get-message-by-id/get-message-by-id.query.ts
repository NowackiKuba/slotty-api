import { Query } from '@common/application/cqrs';
import type { MessageReadModel } from '@messages/application/read-models';

export type GetMessageByIdPayload = {
  userId: string;
  messageId: string;
};

export class GetMessageByIdQuery extends Query<
  GetMessageByIdPayload,
  MessageReadModel
> {
  constructor(payload: GetMessageByIdPayload) {
    super(payload);
  }
}
