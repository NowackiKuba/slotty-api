import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { CreateMessageCommand } from './create-message.command';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { MessageReadModelMapper } from '@messages/application/mappers';
import { MessageReadModel } from '@messages/application/read-models';
import { Message } from '@messages/domain/aggregates';
import { MessageAlreadyExistsException } from '@messages/domain/exceptions';
import type { IMessageRepository } from '@messages/domain/repositories';
import { MESSAGE_REPOSITORY } from '@messages/domain/tokens';

@CommandHandler(CreateMessageCommand)
export class CreateMessageHandler implements ICommandHandler<
  CreateMessageCommand,
  MessageReadModel
> {
  constructor(
    private readonly mapper: MessageReadModelMapper,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(command: CreateMessageCommand): Promise<MessageReadModel> {
    const {
      id,
      userId,
      customerId,
      messageContent,
      sender,
      channel,
      externalMessageId,
      metadata,
    } = command.payload;

    await getOwnedCustomer(this.customerRepository, customerId, userId);

    const existing = await this.messageRepository.findByExternalMessageId(
      userId,
      channel,
      externalMessageId,
    );

    if (existing) {
      throw new MessageAlreadyExistsException({
        userId,
        channel,
        externalMessageId,
      });
    }

    const message = Message.create({
      id,
      userId,
      customerId,
      messageContent,
      sender,
      channel,
      externalMessageId,
      metadata,
    });

    await this.messageRepository.save(message);

    return this.mapper.toReadModel(message);
  }
}
