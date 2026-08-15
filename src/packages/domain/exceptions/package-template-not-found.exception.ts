import { DomainException } from '@common/exceptions';

export class PackageTemplateNotFoundException extends DomainException {
  readonly code = 'PACKAGE_TEMPLATE_NOT_FOUND';
  readonly statusCode = 404;

  constructor(details: { packageTemplateId?: string; userId?: string }) {
    super('Package template not found', details);
  }
}
