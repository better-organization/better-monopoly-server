import swaggerJsdoc from 'swagger-jsdoc';
import { ERROR_MESSAGES } from '../utils/errorMessages';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Better Monopoly Server API',
      version: '1.0.0',
      description:
        'Backend API for Better Monopoly game with game logic and authentication',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'Better Organization',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
      {
        url: 'http://localhost:8080',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login endpoint',
        },
      },
      schemas: {
        // Request schemas
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password', 'userId'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              pattern: '^[a-zA-Z0-9_]+$',
              description:
                'Username (3+ characters, alphanumeric and underscores only)',
              example: 'player123',
            },
            password: {
              type: 'string',
              minLength: 6,
              format: 'password',
              description: 'Password (6+ characters)',
              example: 'SecurePass123',
            },
            userId: {
              type: 'string',
              minLength: 3,
              pattern: '^[a-zA-Z0-9_-]+$',
              description:
                'Unique user identifier (3+ characters, alphanumeric, underscores, and hyphens)',
              example: 'player-123-unique',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['userId', 'password'],
          properties: {
            userId: {
              type: 'string',
              description: 'User identifier used during registration',
              example: 'player-123-unique',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password',
              example: 'SecurePass123',
            },
          },
        },
        UserIdCheckRequest: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: {
              type: 'string',
              minLength: 3,
              pattern: '^[a-zA-Z0-9_-]+$',
              description: 'User identifier to check for availability',
              example: 'player-456-test',
            },
          },
        },

        // Success response schemas
        RegisterResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example:
                'User registered successfully. Please login to continue.',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token for authenticated requests',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        UserIdCheckResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'UserId is available',
            },
          },
        },
        TestResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Auth service is running',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-04T10:30:00.000Z',
            },
          },
        },

        // Error response schemas
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type or message',
              example: 'Validation failed',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
              example: ERROR_MESSAGES.REGISTRATION_REQUIRED_FIELDS,
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation failed',
            },
            message: {
              type: 'string',
              description: 'Specific validation error message',
              enum: [
                ERROR_MESSAGES.REGISTRATION_REQUIRED_FIELDS,
                ERROR_MESSAGES.REGISTRATION_FIELD_TYPES,
                ERROR_MESSAGES.USERNAME_MIN_LENGTH,
                ERROR_MESSAGES.PASSWORD_MIN_LENGTH,
                ERROR_MESSAGES.USERID_MIN_LENGTH,
                ERROR_MESSAGES.USERNAME_PATTERN,
                ERROR_MESSAGES.USERID_PATTERN,
                ERROR_MESSAGES.LOGIN_REQUIRED_FIELDS,
                ERROR_MESSAGES.LOGIN_FIELD_TYPES,
                ERROR_MESSAGES.USERID_REQUIRED,
                ERROR_MESSAGES.USERID_TYPE,
              ],
            },
          },
        },
        ConflictError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Conflict',
            },
            message: {
              type: 'string',
              example: ERROR_MESSAGES.USERID_ALREADY_EXISTS,
            },
          },
        },
        UnauthorizedError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: ERROR_MESSAGES.INVALID_CREDENTIALS,
            },
          },
        },
        RateLimitError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Too Many Requests',
            },
            message: {
              type: 'string',
              example:
                'Too many requests from this IP, please try again later.',
            },
          },
        },
        InternalServerError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Internal Server Error',
            },
            message: {
              type: 'string',
              example: 'An error occurred during registration',
            },
          },
        },
        NotImplementedError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Not Implemented',
            },
            message: {
              type: 'string',
              example: 'Profile endpoint will be implemented later',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration endpoints',
      },
      {
        name: 'Health',
        description: 'Health check and service status endpoints',
      },
      {
        name: 'Game',
        description: 'Game logic and management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
