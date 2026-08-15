import { AggregateRoot } from '@common/domain';
import { CustomerId } from '@customers/domain/value-objects';
import {
  isMessageChannel,
  isMessageSender,
  type MessageChannel,
  type MessageSender,
} from '@messages/domain/enums';
import {
  InvalidMessageChannelException,
  InvalidMessageException,
  InvalidMessageSenderException,
} from '@messages/domain/exceptions';
import type {
  CreateMessageProps,
  MessageMetadata,
  MessageProps,
  MessageSnapshot,
  MessageToolResult,
  MetadataExecutedTool,
} from '@messages/domain/types';
import { MessageId } from '@messages/domain/value-objects';
import { UserId } from '@users/domain/value-objects';

const MAX_CONTENT_LENGTH = 4096;
const MAX_EXTERNAL_ID_LENGTH = 256;
const MAX_TOOL_NAME_LENGTH = 120;
const TOOL_RESULTS = new Set<MessageToolResult>(['SUCCESS', 'FAILED']);

export class Message extends AggregateRoot<MessageId> {
  private _userId: UserId;
  private _customerId: CustomerId;
  private _messageContent: string;
  private _sender: MessageSender;
  private _channel: MessageChannel;
  private _externalMessageId: string;
  private _metadata?: MessageMetadata;

  private constructor(props: MessageProps) {
    super({
      id: MessageId.create(props.id),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });
    this._userId = UserId.create(props.userId);
    this._customerId = CustomerId.create(props.customerId);
    this._messageContent = props.messageContent;
    this._sender = props.sender;
    this._channel = props.channel;
    this._externalMessageId = props.externalMessageId;
    this._metadata = props.metadata;
  }

  static create(props: CreateMessageProps): Message {
    return new Message({
      id: MessageId.create(props.id).value,
      userId: props.userId,
      customerId: props.customerId,
      messageContent: requiredText(
        props.messageContent,
        MAX_CONTENT_LENGTH,
        'messageContent',
      ),
      sender: parseSender(props.sender),
      channel: parseChannel(props.channel),
      externalMessageId: requiredText(
        props.externalMessageId,
        MAX_EXTERNAL_ID_LENGTH,
        'externalMessageId',
      ),
      metadata: parseMetadata(props.metadata),
    });
  }

  static reconstitute(props: MessageProps): Message {
    return new Message(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get messageContent(): string {
    return this._messageContent;
  }

  get sender(): MessageSender {
    return this._sender;
  }

  get channel(): MessageChannel {
    return this._channel;
  }

  get externalMessageId(): string {
    return this._externalMessageId;
  }

  get metadata(): MessageMetadata | undefined {
    return this._metadata
      ? {
          executedTools: this._metadata.executedTools
            ? this._metadata.executedTools.map((tool) => ({ ...tool }))
            : undefined,
        }
      : undefined;
  }

  recordToolExecution(tool: MetadataExecutedTool): void {
    this.assertNotDeleted('record tool execution');

    const executedTool = parseExecutedTool(tool);
    const executedTools = [
      ...(this._metadata?.executedTools ?? []),
      executedTool,
    ];

    this._metadata = { executedTools };
    this.touch();
  }

  toSnapshot(): MessageSnapshot {
    return {
      id: this.id.value,
      userId: this._userId.value,
      customerId: this._customerId.value,
      messageContent: this._messageContent,
      sender: this._sender,
      channel: this._channel,
      externalMessageId: this._externalMessageId,
      metadata: this.metadata ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private assertNotDeleted(action: string): void {
    if (this.isDeleted) {
      throw new InvalidMessageException(`cannot ${action} a deleted message`, {
        action,
      });
    }
  }
}

function parseSender(value: string): MessageSender {
  if (!isMessageSender(value)) {
    throw new InvalidMessageSenderException(value);
  }

  return value;
}

function parseChannel(value: string): MessageChannel {
  if (!isMessageChannel(value)) {
    throw new InvalidMessageChannelException(value);
  }

  return value;
}

function parseMetadata(value?: MessageMetadata): MessageMetadata | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value.executedTools === undefined) {
    return {};
  }

  if (!Array.isArray(value.executedTools)) {
    throw new InvalidMessageException('executed tools must be an array', {
      field: 'metadata.executedTools',
    });
  }

  return {
    executedTools: value.executedTools.map(parseExecutedTool),
  };
}

function parseExecutedTool(value: MetadataExecutedTool): MetadataExecutedTool {
  if (!value || typeof value !== 'object') {
    throw new InvalidMessageException('executed tool is invalid');
  }

  const toolName = requiredText(
    value.toolName,
    MAX_TOOL_NAME_LENGTH,
    'toolName',
  );

  if (
    !value.args ||
    typeof value.args !== 'object' ||
    Array.isArray(value.args)
  ) {
    throw new InvalidMessageException('tool args must be an object', {
      field: 'args',
    });
  }

  if (!isToolResult(value.result)) {
    throw new InvalidMessageException('invalid tool result', {
      result: value.result,
    });
  }

  return {
    toolName,
    args: { ...value.args },
    result: value.result,
  };
}

function isToolResult(value: string): value is MessageToolResult {
  return TOOL_RESULTS.has(value as MessageToolResult);
}

function requiredText(value: string, maxLength: number, field: string): string {
  if (typeof value !== 'string') {
    throw new InvalidMessageException(`${field} is required`, { field });
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new InvalidMessageException(`${field} is required`, { field });
  }

  if (trimmed.length > maxLength) {
    throw new InvalidMessageException(`${field} is too long`, {
      field,
      maxLength,
    });
  }

  return trimmed;
}
