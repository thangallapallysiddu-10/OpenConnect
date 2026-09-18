import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
});
export type PaginationInput = z.infer<typeof paginationSchema>;
export const offsetOf = ({ page, limit }: PaginationInput) => (page - 1) * limit;
export const pageMeta = ({ page, limit }: PaginationInput, total: number) => ({
  page, limit, total, totalPages: Math.ceil(total / limit),
});
