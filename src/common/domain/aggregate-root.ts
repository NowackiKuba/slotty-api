export type AggregateRootProps<TId> = {
  id: TId;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export abstract class AggregateRoot<TId> {
  readonly id: TId;
  readonly createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  protected constructor(props: AggregateRootProps<TId>) {
    this.id = props.id;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? this.createdAt;
    this.deletedAt = props.deletedAt ?? null;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  protected touch(at: Date = new Date()): void {
    this.updatedAt = at;
  }

  softDelete(at: Date = new Date()): void {
    if (this.deletedAt !== null) {
      return;
    }

    this.deletedAt = at;
    this.touch(at);
  }

  restore(at: Date = new Date()): void {
    if (this.deletedAt === null) {
      return;
    }

    this.deletedAt = null;
    this.touch(at);
  }
}
