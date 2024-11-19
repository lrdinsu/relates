import { z } from 'zod';

// Define the Zod schema for query parameters using `z.coerce`
export const PostQuerySchema = z.object({
  cursor: z.coerce.number().int().positive().optional().default(0),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export const PostParamsSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

export const PostCreateParamsSchema = z.object({
  postId: z.coerce.number().int().positive().nullable(),
});
