import { Queue } from 'bullmq';
import {
  AI_MESSAGE_QUEUE,
  PROCESS_INBOUND_MESSAGE_JOB,
  type ProcessMessageJobDto,
} from '@ai/application/dto/process-message-job.dto';
import { Customer } from '@customers/domain/aggregates';
import { CustomerSource } from '@customers/domain/enums';
import { Message } from '@messages/domain/aggregates';
import { MessageChannel, MessageSender } from '@messages/domain/enums';
import type { IMessageRepository } from '@messages/domain/repositories';
import { UserIntegration } from '@users/domain/aggregates';
import { IntegrationProviderEnum } from '@users/domain/enums';
import { InboundWebhookService } from './inbound-webhook.service';
import type { MessageContextResolver } from '../../infrastructure/services/message-context-resolver.service';

const TRAINER_ID = '11111111-1111-4111-8111-111111111111';
const IG_BUSINESS_ID = 'ig-business-1';
const IG_CUSTOMER_ID = 'ig-customer-1';

describe('InboundWebhookService', () => {
  const contextResolver = {
    resolve: jest.fn(),
  };
  const messageRepository = {
    findByExternalMessageId: jest.fn(),
    save: jest.fn(),
  };
  const aiMessageQueue = {
    add: jest.fn(),
  };

  const service = new InboundWebhookService(
    contextResolver as unknown as MessageContextResolver,
    messageRepository as unknown as IMessageRepository,
    aiMessageQueue as unknown as Queue<ProcessMessageJobDto>,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    messageRepository.save.mockResolvedValue(undefined);
  });

  it('stores a customer Instagram message and enqueues AI processing', async () => {
    const customer = Customer.create({
      userId: TRAINER_ID,
      source: CustomerSource.IG,
      firstName: 'Guest',
      instagramAccountId: IG_CUSTOMER_ID,
    });

    contextResolver.resolve.mockResolvedValue({
      trainerId: TRAINER_ID,
      customer,
      sender: MessageSender.CUSTOMER,
      integration: connectedInstagram(),
    });
    messageRepository.findByExternalMessageId.mockResolvedValue(null);

    await service.handleMetaPayload({
      object: 'instagram',
      entry: [
        {
          id: IG_BUSINESS_ID,
          messaging: [
            {
              sender: { id: IG_CUSTOMER_ID },
              recipient: { id: IG_BUSINESS_ID },
              message: { mid: 'mid-1', text: 'Cześć' },
            },
          ],
        },
      ],
    });

    expect(messageRepository.save).toHaveBeenCalledTimes(1);
    expect(aiMessageQueue.add).toHaveBeenCalledWith(
      PROCESS_INBOUND_MESSAGE_JOB,
      expect.objectContaining({
        trainerId: TRAINER_ID,
        customerId: customer.id.value,
        channel: MessageChannel.INSTAGRAM,
        messageContent: 'Cześć',
        externalMessageId: 'mid-1',
      }),
      expect.objectContaining({
        jobId: 'inbound:INSTAGRAM:mid-1',
      }),
    );
    expect(AI_MESSAGE_QUEUE).toBe('ai-message-processing');
  });

  it('ignores duplicated webhooks by externalMessageId', async () => {
    const customer = Customer.create({
      userId: TRAINER_ID,
      source: CustomerSource.IG,
      firstName: 'Guest',
      instagramAccountId: IG_CUSTOMER_ID,
    });

    contextResolver.resolve.mockResolvedValue({
      trainerId: TRAINER_ID,
      customer,
      sender: MessageSender.CUSTOMER,
      integration: connectedInstagram(),
    });
    messageRepository.findByExternalMessageId.mockResolvedValue(
      Message.create({
        userId: TRAINER_ID,
        customerId: customer.id.value,
        messageContent: 'Cześć',
        sender: MessageSender.CUSTOMER,
        channel: MessageChannel.INSTAGRAM,
        externalMessageId: 'mid-1',
      }),
    );

    await service.handleMetaPayload({
      object: 'instagram',
      entry: [
        {
          id: IG_BUSINESS_ID,
          messaging: [
            {
              sender: { id: IG_CUSTOMER_ID },
              recipient: { id: IG_BUSINESS_ID },
              message: { mid: 'mid-1', text: 'Cześć' },
            },
          ],
        },
      ],
    });

    expect(messageRepository.save).not.toHaveBeenCalled();
    expect(aiMessageQueue.add).not.toHaveBeenCalled();
  });

  it('stores trainer echoes without enqueueing AI processing', async () => {
    const customer = Customer.create({
      userId: TRAINER_ID,
      source: CustomerSource.IG,
      firstName: 'Anna',
      instagramAccountId: IG_CUSTOMER_ID,
    });

    contextResolver.resolve.mockResolvedValue({
      trainerId: TRAINER_ID,
      customer,
      sender: MessageSender.TRAINER,
      integration: connectedInstagram(),
    });
    messageRepository.findByExternalMessageId.mockResolvedValue(null);

    await service.handleMetaPayload({
      object: 'instagram',
      entry: [
        {
          id: IG_BUSINESS_ID,
          messaging: [
            {
              sender: { id: IG_BUSINESS_ID },
              recipient: { id: IG_CUSTOMER_ID },
              message: { mid: 'mid-echo', text: 'Jutro o 18', is_echo: true },
            },
          ],
        },
      ],
    });

    expect(messageRepository.save).toHaveBeenCalledTimes(1);
    expect(aiMessageQueue.add).not.toHaveBeenCalled();
  });
});

function connectedInstagram(): UserIntegration {
  return UserIntegration.create({
    userId: TRAINER_ID,
    provider: IntegrationProviderEnum.INSTAGRAM_DM,
    externalAccountId: IG_BUSINESS_ID,
    settings: {
      instagramBusinessAccountId: IG_BUSINESS_ID,
      facebookPageId: 'page-1',
    },
  });
}
