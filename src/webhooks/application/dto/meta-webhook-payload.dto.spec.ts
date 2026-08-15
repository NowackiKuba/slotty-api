import { MessageChannel } from '@messages/domain/enums';
import { IntegrationProviderEnum } from '@users/domain/enums';
import { extractMetaInboundEvents } from './meta-webhook-payload.dto';

describe('extractMetaInboundEvents', () => {
  it('extracts Instagram customer text messages', () => {
    const events = extractMetaInboundEvents({
      object: 'instagram',
      entry: [
        {
          id: 'ig-biz',
          messaging: [
            {
              sender: { id: 'ig-customer' },
              recipient: { id: 'ig-biz' },
              message: { mid: 'mid-1', text: 'Hello' },
            },
          ],
        },
      ],
    });

    expect(events).toEqual([
      expect.objectContaining({
        channel: MessageChannel.INSTAGRAM,
        provider: IntegrationProviderEnum.INSTAGRAM_DM,
        senderId: 'ig-customer',
        recipientId: 'ig-biz',
        externalMessageId: 'mid-1',
        messageContent: 'Hello',
        isEcho: false,
      }),
    ]);
  });

  it('extracts WhatsApp inbound text and skips status updates', () => {
    const events = extractMetaInboundEvents({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba-1',
          changes: [
            {
              field: 'messages',
              value: {
                metadata: { phone_number_id: 'phone-1' },
                contacts: [
                  { wa_id: '48500111222', profile: { name: 'Jan Kowalski' } },
                ],
                messages: [
                  {
                    from: '48500111222',
                    id: 'wamid.1',
                    type: 'text',
                    text: { body: 'Cześć' },
                  },
                ],
                statuses: [{ id: 'wamid.0', status: 'delivered' }],
              },
            },
          ],
        },
      ],
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(
      expect.objectContaining({
        channel: MessageChannel.WHATSAPP,
        provider: IntegrationProviderEnum.WHATSAPP_CLOUD,
        senderId: '48500111222',
        recipientId: 'phone-1',
        externalMessageId: 'wamid.1',
        messageContent: 'Cześć',
        isEcho: false,
        customerDisplayName: 'Jan Kowalski',
      }),
    );
  });

  it('marks WhatsApp smb echoes as trainer-sent', () => {
    const events = extractMetaInboundEvents({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba-1',
          changes: [
            {
              field: 'smb_message_echoes',
              value: {
                metadata: { phone_number_id: 'phone-1' },
                messages: [
                  {
                    from: 'phone-1',
                    to: '48500111222',
                    id: 'wamid.echo',
                    type: 'text',
                    text: { body: 'Potwierdzam' },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(events[0]?.isEcho).toBe(true);
    expect(events[0]?.senderId).toBe('phone-1');
    expect(events[0]?.recipientId).toBe('48500111222');
  });
});
