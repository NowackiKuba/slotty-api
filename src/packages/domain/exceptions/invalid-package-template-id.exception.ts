import { DomainException } from '@common/exceptions';

export class InvalidPackageTemplateIdException extends DomainException {
  readonly code = 'INVALID_PACKAGE_TEMPLATE_ID';
  readonly statusCode = 400;

  constructor(packageTemplateId: string) {
    super('Invalid package template id', { packageTemplateId });
  }
}
