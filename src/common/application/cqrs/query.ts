import { Query as CqrsQuery } from '@nestjs/cqrs';

export abstract class Query<TPayload = void, TResult = unknown> extends CqrsQuery<TResult> {
  protected constructor(public readonly payload: TPayload) {
    super();
  }
}
