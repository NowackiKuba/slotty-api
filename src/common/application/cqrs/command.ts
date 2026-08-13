export abstract class Command<TPayload = void> {
  protected constructor(public readonly payload: TPayload) {}
}
