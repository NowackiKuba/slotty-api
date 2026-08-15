import { DomainException } from '@common/exceptions';

export class PackageTemplateAccessDeniedException extends DomainException {
  readonly code = 'PACKAGE_TEMPLATE_ACCESS_DENIED';
  readonly statusCode = 403;

  constructor(details: { packageTemplateId?: string; userId?: string }) {
    super('Package template access denied', details);
  }
}
