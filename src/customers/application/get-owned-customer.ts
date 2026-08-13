import { Customer } from '@customers/domain/aggregates';
import {
  CustomerAccessDeniedException,
  CustomerNotFoundException,
} from '@customers/domain/exceptions';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CustomerId } from '@customers/domain/value-objects';

export async function getOwnedCustomer(
  customerRepository: ICustomerRepository,
  customerId: string,
  userId: string,
  options?: { includeDeleted?: boolean },
): Promise<Customer> {
  CustomerId.create(customerId);

  const customer = options?.includeDeleted
    ? await customerRepository.findByIdIncludingDeleted(customerId)
    : await customerRepository.findById(customerId);

  if (!customer) {
    throw new CustomerNotFoundException({ customerId });
  }

  if (customer.userId.value !== userId) {
    throw new CustomerAccessDeniedException({ customerId, userId });
  }

  return customer;
}
