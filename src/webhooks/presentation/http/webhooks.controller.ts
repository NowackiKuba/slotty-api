import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RawBodyRequest } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { InboundWebhookService } from '../../application/services/inbound-webhook.service';
import { MetaWebhookPayloadDto } from '../../application/dto/meta-webhook-payload.dto';
import { SmsWebhookPayloadDto } from '../../application/dto/sms-webhook-payload.dto';
import { VerifyWebhookQueryDto } from '../../application/dto/verify-webhook-query.dto';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly inboundWebhookService: InboundWebhookService,
    private readonly config: ConfigService,
  ) {}

  @Get('meta')
  @Header('Content-Type', 'text/plain')
  verifyMeta(@Query() query: VerifyWebhookQueryDto): string {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
    const expectedToken = this.config.get<string>('META_WEBHOOK_VERIFY_TOKEN');

    if (
      mode !== 'subscribe' ||
      !token ||
      !challenge ||
      !expectedToken ||
      !secureEquals(token, expectedToken)
    ) {
      throw new ForbiddenException('Invalid webhook verification');
    }

    return challenge;
  }

  @Post('meta')
  @HttpCode(HttpStatus.OK)
  async handleMeta(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Body() body: MetaWebhookPayloadDto,
  ): Promise<{ success: true }> {
    this.assertMetaSignature(request.rawBody, signature);

    try {
      await this.inboundWebhookService.handleMetaPayload(body);
    } catch (error) {
      this.logger.error(
        'Failed to process Meta webhook payload',
        error instanceof Error ? error.stack : error,
      );
    }

    return { success: true };
  }

  @Post('sms')
  @HttpCode(HttpStatus.OK)
  async handleSms(
    @Headers('x-webhook-secret') secret: string | undefined,
    @Body() body: SmsWebhookPayloadDto,
  ): Promise<{ success: true }> {
    this.assertSmsSecret(secret);

    try {
      await this.inboundWebhookService.handleSmsPayload(body);
    } catch (error) {
      this.logger.error(
        'Failed to process SMS webhook payload',
        error instanceof Error ? error.stack : error,
      );
    }

    return { success: true };
  }

  private assertMetaSignature(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ): void {
    const appSecret = this.config.get<string>('META_INTEGRATION_APP_SECRET');

    if (!appSecret) {
      if (this.config.get<string>('NODE_ENV') === 'production') {
        throw new ForbiddenException(
          'Meta webhook signature is not configured',
        );
      }

      this.logger.warn(
        'Skipping Meta webhook signature verification — META_INTEGRATION_APP_SECRET is not set',
      );
      return;
    }

    if (!signature) {
      if (this.config.get<string>('NODE_ENV') === 'production') {
        throw new ForbiddenException('Invalid Meta webhook signature');
      }

      this.logger.warn(
        'Skipping Meta webhook signature verification — X-Hub-Signature-256 is missing',
      );
      return;
    }

    if (!rawBody || !signature.startsWith('sha256=')) {
      throw new ForbiddenException('Invalid Meta webhook signature');
    }

    const expected = `sha256=${createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex')}`;

    if (!secureEquals(signature, expected)) {
      throw new ForbiddenException('Invalid Meta webhook signature');
    }
  }

  private assertSmsSecret(secret: string | undefined): void {
    const expected = this.config.get<string>('SMS_WEBHOOK_SECRET');

    if (!expected) {
      if (this.config.get<string>('NODE_ENV') === 'production') {
        throw new ForbiddenException('SMS webhook secret is not configured');
      }

      return;
    }

    if (!secret || !secureEquals(secret, expected)) {
      throw new ForbiddenException('Invalid SMS webhook secret');
    }
  }
}

function secureEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
