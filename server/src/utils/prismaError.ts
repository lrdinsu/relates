import { Prisma } from '../../generated/prisma/client';

// True when a Prisma call failed with a specific known error code. We use this
// to make toggle operations idempotent under a race: when two identical
// requests run at once, the loser hits the @@unique constraint (P2002 on
// create) or finds the row already gone (P2025 on delete). That is not a real
// failure, it just means the desired state already holds, so the caller treats
// it as a no-op instead of a 500.
export function isPrismaErrorCode(err: unknown, code: string): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === code
  );
}
