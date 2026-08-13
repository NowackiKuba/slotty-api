import { Customer } from '@customers/domain/aggregates';
import { CustomerAlreadyExistsException } from '@customers/domain/exceptions';
import type { ICustomerRepository } from '@customers/domain/repositories';

export async function assertCustomerUniqueForUser(
  customerRepository: ICustomerRepository,
  customer: Customer,
): Promise<void> {
  const userId = customer.userId.value;
  const customerId = customer.id.value;

  if (customer.email) {
    const existing = await customerRepository.findByUserIdAndEmail(
      userId,
      customer.email,
    );

    if (existing && existing.id.value !== customerId) {
      throw new CustomerAlreadyExistsException({
        userId,
        field: 'email',
        email: customer.email,
      });
    }
  }

  if (customer.phoneNumber) {
    const existing = await customerRepository.findByUserIdAndPhone(
      userId,
      customer.phoneNumber,
    );

    if (existing && existing.id.value !== customerId) {
      throw new CustomerAlreadyExistsException({
        userId,
        field: 'phoneNumber',
        phoneNumber: customer.phoneNumber,
      });
    }
  }

  if (customer.instagramAccountId) {
    const existing = await customerRepository.findByUserIdAndInstagramAccountId(
      userId,
      customer.instagramAccountId,
    );

    if (existing && existing.id.value !== customerId) {
      throw new CustomerAlreadyExistsException({
        userId,
        field: 'instagramAccountId',
        instagramAccountId: customer.instagramAccountId,
      });
    }
  }

  if (customer.whatsappAccountId) {
    const existing = await customerRepository.findByUserIdAndWhatsappAccountId(
      userId,
      customer.whatsappAccountId,
    );

    if (existing && existing.id.value !== customerId) {
      throw new CustomerAlreadyExistsException({
        userId,
        field: 'whatsappAccountId',
        whatsappAccountId: customer.whatsappAccountId,
      });
    }
  }
}
