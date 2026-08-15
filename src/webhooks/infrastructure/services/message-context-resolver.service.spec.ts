import { MessageChannel, MessageSender } from '@messages/domain/enums';
import { Customer } from '@customers/domain/aggregates';
import { CustomerSource } from '@customers/domain/enums';
import { CustomerStatusEnum } from '@customers/domain/value-objects';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { UserIntegration } from '@users/domain/aggregates';
import { IntegrationProviderEnum } from '@users/domain/enums';
import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { MessageContextResolver } from './message-context-resolver.service';

const TRAINER_ID = '11111111-1111-4111-8111-111111111111';
const IG_BUSINESS_ID = 'ig-business-1';
const IG_CUSTOMER_ID = 'ig-customer-1';

describe('MessageContextResolver', () => {
  const userIntegrationRepository = {
    findUsableByProviderAndAccountIds: jest.fn(),
  };
  const customerRepository = {
    findByUserIdAndInstagramAccountId: jest.fn(),
    findByUserIdAndWhatsappAccountId: jest.fn(),
    findByUserIdAndPhone: jest.fn(),
    save: jest.fn(),
  };

  const resolver = new MessageContextResolver(
    userIntegrationRepository as unknown as IUserIntegrationRepository,
    customerRepository as unknown as ICustomerRepository,
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns null when no usable trainer integration exists', async () => {
    userIntegrationRepository.findUsableByProviderAndAccountIds.mockResolvedValue(
      null,
    );

    await expect(
      resolver.resolve({
        channel: MessageChannel.INSTAGRAM,
        provider: IntegrationProviderEnum.INSTAGRAM_DM,
        senderId: IG_CUSTOMER_ID,
        recipientId: IG_BUSINESS_ID,
        businessAccountIds: [IG_BUSINESS_ID],
        isEcho: false,
      }),
    ).resolves.toBeNull();
  });

  it('creates a GUEST customer for a new Instagram sender', async () => {
    userIntegrationRepository.findUsableByProviderAndAccountIds.mockResolvedValue(
      connectedInstagram(),
    );
    customerRepository.findByUserIdAndInstagramAccountId.mockResolvedValue(
      null,
    );
    customerRepository.save.mockResolvedValue(undefined);

    const result = await resolver.resolve({
      channel: MessageChannel.INSTAGRAM,
      provider: IntegrationProviderEnum.INSTAGRAM_DM,
      senderId: IG_CUSTOMER_ID,
      recipientId: IG_BUSINESS_ID,
      businessAccountIds: [IG_BUSINESS_ID],
      isEcho: false,
    });

    expect(result?.sender).toBe(MessageSender.CUSTOMER);
    expect(result?.trainerId).toBe(TRAINER_ID);
    expect(result?.customer.source).toBe(CustomerSource.IG);
    expect(result?.customer.status.value).toBe(CustomerStatusEnum.GUEST);
    expect(result?.customer.instagramAccountId).toBe(IG_CUSTOMER_ID);
    expect(result?.customer.firstName).toBe('Guest');
    expect(customerRepository.save).toHaveBeenCalledTimes(1);
  });

  it('marks native trainer echoes as TRAINER and uses the recipient as the customer', async () => {
    const existing = Customer.create({
      userId: TRAINER_ID,
      source: CustomerSource.IG,
      firstName: 'Anna',
      instagramAccountId: IG_CUSTOMER_ID,
    });

    userIntegrationRepository.findUsableByProviderAndAccountIds.mockResolvedValue(
      connectedInstagram(),
    );
    customerRepository.findByUserIdAndInstagramAccountId.mockResolvedValue(
      existing,
    );

    const result = await resolver.resolve({
      channel: MessageChannel.INSTAGRAM,
      provider: IntegrationProviderEnum.INSTAGRAM_DM,
      senderId: IG_BUSINESS_ID,
      recipientId: IG_CUSTOMER_ID,
      businessAccountIds: [IG_BUSINESS_ID],
      isEcho: true,
    });

    expect(result?.sender).toBe(MessageSender.TRAINER);
    expect(result?.customer.id.value).toBe(existing.id.value);
    expect(customerRepository.save).not.toHaveBeenCalled();
    expect(
      customerRepository.findByUserIdAndInstagramAccountId,
    ).toHaveBeenCalledWith(TRAINER_ID, IG_CUSTOMER_ID);
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
