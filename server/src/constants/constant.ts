export const enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  SERVER_ERROR = 500,
}

function createEntityMessages(entity: string) {
  return {
    CREATED: `${entity} created successfully`,
    DELETED: `${entity} deleted successfully`,
    UPDATED: `${entity} updated successfully`,
    NOT_FOUND: `${entity} not found`,
  } as const;
}

export const ApplicationMessage = {
  SERVER_ERROR: 'Internal Server Error, try again later!',
  ID_FORMAT_ERROR: 'ID must be a positive number',
  DATABASE_ERROR: 'Database error',
};
export const TourMessage = createEntityMessages('Tour');
export const UserMessage = {
  ...createEntityMessages('User'),
  EMAIL_DUPLICATE_ERROR: 'Email already exists',
  AUTHENTICATION_ERROR: 'Email or password is incorrect',
  UNAUTHORIZED_ACCESS_ERROR:
    'You are not logged in! Please log in to get access.',
  EMAIL_NOT_FOUND_ERROR: 'There is no user with email address.',
} as const;
