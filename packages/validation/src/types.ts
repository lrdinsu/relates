import { z } from 'zod';

import { UserSchema } from './schemas.js';

export type UserType = z.infer<typeof UserSchema>;
