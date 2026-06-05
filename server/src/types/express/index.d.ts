declare global {
  namespace Express {
    interface Request {
      // The authenticated user id, taken from the verified access token.
      user?: { id: number };
    }
  }
}

export {};
