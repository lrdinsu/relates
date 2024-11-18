import { z } from 'zod';

// Define the Zod schema for query parameters using `z.coerce`
export const PostQuerySchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().default(20),
});
