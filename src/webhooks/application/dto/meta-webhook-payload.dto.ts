import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MessageChannel } from '@messages/domain/enums';
import { IntegrationProviderEnum } from '@users/domain/enums';

export const metaWebhookPayloadSchema = z
  .object({
    object: z.string().min(1),
    entry: z.array(z.unknown()).optional(),
  })
  .passthrough();

export class MetaWebhookPayloadDto extends createZodDto(
  metaWebhookPayloadSchema,
) {}

export type InboundMessageEvent = {
  channel: MessageChannel;
  provider: IntegrationProviderEnum;
  senderId: string;
  recipientId: string;
  businessAccountIds: string[];
  externalMessageId: string;
  messageContent: string;
  isEcho: boolean;
  customerDisplayName?: string;
};

const MAX_CONTENT_LENGTH = 4096;

type JsonRecord = Record<string, unknown>;

export function extractMetaInboundEvents(
  payload: MetaWebhookPayloadDto,
): InboundMessageEvent[] {
  const objectType = payload.object.trim().toLowerCase();
  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  const events: InboundMessageEvent[] = [];

  for (const entry of entries) {
    if (!isRecord(entry)) {
      continue;
    }

    if (objectType === 'whatsapp_business_account') {
      events.push(...extractWhatsAppEvents(entry));
      continue;
    }

    events.push(...extractInstagramEvents(entry));
  }

  return events;
}

function extractInstagramEvents(entry: JsonRecord): InboundMessageEvent[] {
  const entryId = asString(entry.id);
  const messaging = [...asArray(entry.messaging), ...asArray(entry.standby)];
  const events: InboundMessageEvent[] = [];

  for (const item of messaging) {
    if (!isRecord(item) || !isRecord(item.message)) {
      continue;
    }

    const message = item.message;
    const externalMessageId = asString(message.mid);

    if (!externalMessageId) {
      continue;
    }

    const senderId = asString(asRecord(item.sender)?.id);
    const recipientId = asString(asRecord(item.recipient)?.id);
    const text = asString(message.text);
    const content = text || describeAttachments(asArray(message.attachments));

    if (!senderId || !recipientId || !content) {
      continue;
    }

    const isEcho = message.is_echo === true;

    events.push({
      channel: MessageChannel.INSTAGRAM,
      provider: IntegrationProviderEnum.INSTAGRAM_DM,
      senderId,
      recipientId,
      businessAccountIds: uniqueIds([entryId, isEcho ? senderId : recipientId]),
      externalMessageId,
      messageContent: clipContent(content),
      isEcho,
    });
  }

  return events;
}

function extractWhatsAppEvents(entry: JsonRecord): InboundMessageEvent[] {
  const wabaId = asString(entry.id);
  const events: InboundMessageEvent[] = [];

  for (const change of asArray(entry.changes)) {
    if (!isRecord(change) || !isRecord(change.value)) {
      continue;
    }

    const field = asString(change.field);
    const value = change.value;
    const metadata = asRecord(value.metadata);
    const phoneNumberId = asString(metadata?.phone_number_id);
    const displayPhoneNumber = normalizePhone(
      asString(metadata?.display_phone_number),
    );
    const contactsByWaId = indexWhatsAppContacts(asArray(value.contacts));
    const businessAccountIds = uniqueIds([
      phoneNumberId,
      wabaId,
      displayPhoneNumber,
    ]);

    if (field === 'smb_message_echoes' || field === 'message_echoes') {
      const echoes = [
        ...asArray(value.message_echoes),
        ...asArray(value.messages),
      ];

      for (const echo of echoes) {
        const event = toWhatsAppEvent({
          message: echo,
          phoneNumberId,
          businessAccountIds,
          contactsByWaId,
          isEcho: true,
        });

        if (event) {
          events.push(event);
        }
      }

      continue;
    }

    if (field && field !== 'messages') {
      continue;
    }

    for (const message of asArray(value.messages)) {
      const event = toWhatsAppEvent({
        message,
        phoneNumberId,
        businessAccountIds,
        contactsByWaId,
        isEcho: false,
      });

      if (event) {
        events.push(event);
      }
    }
  }

  return events;
}

function toWhatsAppEvent(input: {
  message: unknown;
  phoneNumberId: string;
  businessAccountIds: string[];
  contactsByWaId: Map<string, string>;
  isEcho: boolean;
}): InboundMessageEvent | null {
  if (!isRecord(input.message)) {
    return null;
  }

  const externalMessageId = asString(input.message.id);
  const from = normalizeWhatsAppId(asString(input.message.from));
  const to = normalizeWhatsAppId(
    asString(input.message.to) || input.phoneNumberId,
  );
  const content = extractWhatsAppContent(input.message);

  if (!externalMessageId || !from || !to || !content) {
    return null;
  }

  const senderId = from;
  const recipientId = to;
  const isEcho = input.isEcho || input.businessAccountIds.includes(senderId);

  return {
    channel: MessageChannel.WHATSAPP,
    provider: IntegrationProviderEnum.WHATSAPP_CLOUD,
    senderId,
    recipientId,
    businessAccountIds: uniqueIds([
      ...input.businessAccountIds,
      isEcho ? senderId : recipientId,
    ]),
    externalMessageId,
    messageContent: clipContent(content),
    isEcho,
    customerDisplayName: input.contactsByWaId.get(
      isEcho ? recipientId : senderId,
    ),
  };
}

function extractWhatsAppContent(message: JsonRecord): string {
  const type = asString(message.type) || 'text';

  if (type === 'reaction' || type === 'system' || type === 'unsupported') {
    return '';
  }

  const text = asRecord(message.text);
  if (asString(text?.body)) {
    return asString(text?.body);
  }

  const captionSources = ['image', 'video', 'document', 'audio'];
  for (const key of captionSources) {
    const media = asRecord(message[key]);
    const caption = asString(media?.caption);
    if (caption) {
      return caption;
    }
  }

  const button = asRecord(message.button);
  if (asString(button?.text)) {
    return asString(button?.text);
  }

  const interactive = asRecord(message.interactive);
  const buttonReply = asRecord(interactive?.button_reply);
  const listReply = asRecord(interactive?.list_reply);
  if (asString(buttonReply?.title)) {
    return asString(buttonReply?.title);
  }
  if (asString(listReply?.title)) {
    return asString(listReply?.title);
  }

  if (
    captionSources.includes(type) ||
    type === 'sticker' ||
    type === 'location'
  ) {
    return `[${type}]`;
  }

  return '';
}

function indexWhatsAppContacts(contacts: unknown[]): Map<string, string> {
  const names = new Map<string, string>();

  for (const contact of contacts) {
    if (!isRecord(contact)) {
      continue;
    }

    const waId = normalizeWhatsAppId(asString(contact.wa_id));
    const profile = asRecord(contact.profile);
    const name = asString(profile?.name);

    if (waId && name) {
      names.set(waId, name);
    }
  }

  return names;
}

function describeAttachments(attachments: unknown[]): string {
  const types = attachments
    .map((attachment) =>
      isRecord(attachment) ? asString(attachment.type) : '',
    )
    .filter(Boolean);

  if (types.length === 0) {
    return '';
  }

  return `[${types[0]}]`;
}

function clipContent(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length <= MAX_CONTENT_LENGTH) {
    return trimmed;
  }

  return trimmed.slice(0, MAX_CONTENT_LENGTH);
}

function uniqueIds(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalizeWhatsAppId(value: string): string {
  return value.replace(/@.*$/, '').replace(/\s/g, '');
}

function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '');
}

function asString(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === 'string' ? value.trim() : '';
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): JsonRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
