import { DomainException } from '@common/exceptions';

export class PackageTemplateAlreadyDeletedException extends DomainException {
  readonly code = 'PACKAGE_TEMPLATE_ALREADY_DELETED';
  readonly statusCode = 409;

  constructor(details: { packageTemplateId?: string; userId?: string }) {
    super('Package template is already deleted', details);
  }
}
