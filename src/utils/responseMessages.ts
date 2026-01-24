// Validation error message constants
export const RESPONSE_MESSAGES = {
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
  USER_REGISTERED_SUCCESSFULLY: 'User registered successfully',
  USERID_AVAILABLE: 'UserId is available',
  LOGIN_SUCCESSFUL: 'Login successful',
  LOGGED_OUT_SUCCESSFULLY: 'Logged out successfully',

  // Auth controller errors
  VALIDATION_ERROR: 'An error occurred during validating user id',
  REGISTRATION_ERROR: 'An error occurred during registration',
  LOGIN_ERROR: 'An error occurred during login',
  PROFILE_NOT_IMPLEMENTED: 'Profile endpoint will be implemented later',
  PROFILE_ERROR: 'An error occurred while fetching profile',
  LOGOUT_ERROR: 'An error occurred during logout',

  // Auth service errors
  VALIDATION_SERVICE_ERROR: 'An error occurred during validation',
  REGISTRATION_SERVICE_ERROR: 'An error occurred during registration',
  LOGIN_SERVICE_ERROR: 'An error occurred during login',
  USER_REGISTRATION_SUCCESS:
    'User registered successfully. Please login to continue.',

  // Room errors
  REQUIRED_PROPERTY_NOT_FOUND_IN_TOKEN: 'Required Property not found in token',
  REQUIRED_PROPERTY_NOT_FOUND_IN_REQUEST:
    'Required Property not found in request',
  ROOM_NOT_FOUND: 'Room not found',
  ROOM_CREATION_FAILED: 'Failed to create room',
  ROOM_CREATED_SUCCESSFULLY: 'Room created successfully',
  ROOM_JOIN_FAILED: 'Failed to join room',
  ROOM_JOINED_SUCCESSFULLY: 'Joined room successfully',
  ROOM_JOIN_ERROR: 'An error occurred while trying to join the room',
  ROOM_STATUS_RETRIEVED_SUCCESSFULLY: 'Room status retrieved successfully',
  GAME_STARTED_SUCCESSFULLY: 'Game started successfully',
  NOT_ENOUGH_PLAYERS: 'Not enough players to start the game',
  GAME_ALREADY_STARTED: 'Game has already started',
  NOT_ROOM_HOST: 'Only the room host can start the game',
  GAME_START_ERROR: 'An error occurred while starting the game',
  ROOM_NOT_FOUND_FOR_START: 'Room not found',

  // Game controller errors
  ROLL_DICE_ERROR: 'An error occurred while rolling dice',

  // Board controller errors
  BOARD_MISSING_PARAMETERS: 'Board ID and version are required',
  BOARD_NOT_FOUND: 'Board not found',
  BOARD_INTERNAL_ERROR: 'An error occurred while fetching board layout',

  // Middleware errors
  AUTH_TOKEN_REQUIRED: 'Authentication token is required',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_VERIFICATION_ERROR: 'Error verifying authentication token',

  // General errors
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
} as const;
