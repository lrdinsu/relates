import { HttpStatusCode } from '@/constants/constant.js';

export class HttpError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: HttpStatusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatusCode.NOT_FOUND);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatusCode.BAD_REQUEST);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatusCode.UNAUTHORIZED);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatusCode.FORBIDDEN);
  }
}

export class ServerError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatusCode.SERVER_ERROR);
  }
}
