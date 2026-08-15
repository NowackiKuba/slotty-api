import { CustomerPackage } from '@packages/domain/aggregates';
import {
  CustomerPackageAccessDeniedException,
  CustomerPackageNotFoundException,
} from '@packages/domain/exceptions';
import type { ICustomerPackageRepository } from '@packages/domain/repositories';
import { CustomerPackageId } from '@packages/domain/value-objects';

export async function getOwnedCustomerPackage(
  customerPackageRepository: ICustomerPackageRepository,
  customerPackageId: string,
  userId: string,
  options?: { includeDeleted?: boolean },
): Promise<CustomerPackage> {
  CustomerPackageId.create(customerPackageId);

  const customerPackage = options?.includeDeleted
    ? await customerPackageRepository.findByIdIncludingDeleted(
        customerPackageId,
      )
    : await customerPackageRepository.findById(customerPackageId);

  if (!customerPackage) {
    throw new CustomerPackageNotFoundException({ customerPackageId, userId });
  }

  if (customerPackage.userId.value !== userId) {
    throw new CustomerPackageAccessDeniedException({
      customerPackageId,
      userId,
    });
  }

  return customerPackage;
}
