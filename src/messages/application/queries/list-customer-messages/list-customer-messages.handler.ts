import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { PaginatedResult } from '@common/pagination';
import { ListCustomerMessagesQuery } from './list-customer-messages.query';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { MessageReadModelMapper } from '@messages/application/mappers';
import type { MessageReadModel } from '@messages/application/read-models';
import type { IMessageRepository } from '@messages/domain/repositories';
import { MESSAGE_REPOSITORY } from '@messages/domain/tokens';

@QueryHandler(ListCustomerMessagesQuery)
export class ListCustomerMessagesHandler implements IQueryHandler<
  ListCustomerMessagesQuery,
  PaginatedResult<MessageReadModel>
> {
  constructor(
    private readonly mapper: MessageReadModelMapper,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    query: ListCustomerMessagesQuery,
  ): Promise<PaginatedResult<MessageReadModel>> {
    const { userId, customerId, ...pagination } = query.payload;

    await getOwnedCustomer(this.customerRepository, customerId, userId);

    const result = await this.messageRepository.findByCustomerId(
      userId,
      customerId,
      pagination,
    );

    return PaginatedResult.create(
      result.data.map((message) => this.mapper.toReadModel(message)),
      result.meta.total,
      pagination,
    );
  }
}
