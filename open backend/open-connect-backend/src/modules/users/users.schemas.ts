import { z } from 'zod';

export const updateMeSchema = z.object({
  displayName: z.string().min(2).max(120).optional(),
  avatarUrl: z.string().url().max(600).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
