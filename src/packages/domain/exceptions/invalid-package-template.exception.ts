import { DomainException } from '@common/exceptions';

export class InvalidPackageTemplateException extends DomainException {
  readonly code = 'INVALID_PACKAGE_TEMPLATE';
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
