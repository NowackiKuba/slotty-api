import { Query } from '@common/application/cqrs';
import type { EventReadModel } from '@events/application/read-models';

export type GetEventByIdPayload = {
  userId: string;
  eventId: string;
};

export class GetEventByIdQuery extends Query<
  GetEventByIdPayload,
  EventReadModel
> {
  constructor(payload: GetEventByIdPayload) {
    super(payload);
  }
}
