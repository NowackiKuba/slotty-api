import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class PaginationQuery extends createZodDto(paginationSchema) {}

export type PaginationInput = z.infer<typeof paginationSchema>;

export function getOffset(
  query: Pick<PaginationInput, 'page' | 'limit'>,
): number {
  return (query.page - 1) * query.limit;
}
