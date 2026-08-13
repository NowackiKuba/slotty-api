import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { DomainException } from './domain.exception';

export type ErrorResponseBody = {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
};

@Catch()
export class DomainErrorMapper implements ExceptionFilter {
  private readonly logger = new Logger(DomainErrorMapper.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url: string }>();
    const body = this.map(exception, request.url);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    response.status(body.statusCode).json(body);
  }

  protected map(exception: unknown, path: string): ErrorResponseBody {
    const timestamp = new Date().toISOString();

    if (exception instanceof DomainException) {
      return {
        statusCode: exception.statusCode,
        code: exception.code,
        message: exception.message,
        details: exception.details,
        timestamp,
        path,
      };
    }

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        details: { errors: zodError.issues },
        timestamp,
        path,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const { message, details } = this.normalizeHttpResponse(exceptionResponse);

      return {
        statusCode,
        code: this.httpCode(statusCode),
        message,
        details,
        timestamp,
        path,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      timestamp,
      path,
    };
  }

  private normalizeHttpResponse(response: string | object): {
    message: string;
    details?: Record<string, unknown>;
  } {
    if (typeof response === 'string') {
      return { message: response };
    }

    const payload = response as {
      message?: string | string[];
      error?: string;
      [key: string]: unknown;
    };

    if (Array.isArray(payload.message)) {
      return {
        message: 'Validation failed',
        details: { errors: payload.message },
      };
    }

    return {
      message: payload.message ?? payload.error ?? 'Request failed',
      details:
        payload.message || payload.error
          ? undefined
          : (payload as Record<string, unknown>),
    };
  }

  private httpCode(statusCode: number): string {
    return HttpStatus[statusCode] ?? 'HTTP_ERROR';
  }
}
