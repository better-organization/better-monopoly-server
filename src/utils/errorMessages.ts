// Validation error message constants
export const ERROR_MESSAGES = {
  // Registration errors
  REGISTRATION_REQUIRED_FIELDS: 'Username, password, and userId are required',
  REGISTRATION_FIELD_TYPES: 'Username, password, and userId must be strings',
  USERNAME_MIN_LENGTH: 'Username must be at least 3 characters long',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long',
  USERID_MIN_LENGTH: 'UserId must be at least 3 characters long',
  USERNAME_PATTERN:
    'Username can only contain letters, numbers, and underscores',
  USERID_PATTERN:
    'UserId can only contain letters, numbers, underscores, and hyphens',

  // Login errors
  LOGIN_REQUIRED_FIELDS: 'Both userId and password are required',
  LOGIN_FIELD_TYPES: 'UserId and password must be strings',

  // UserId validation errors
  USERID_REQUIRED: 'UserId is required',
  USERID_TYPE: 'UserId must be a string',

  // Business logic errors
  USERID_ALREADY_EXISTS: 'UserId already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
} as const;
