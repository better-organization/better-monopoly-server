// Simple validation with object-based checks
import { RESPONSE_MESSAGES } from './responseMessages';

export const validateRegistration = (
  username: string,
  password: string,
  userId: string
): void => {
  const registrationChecks = {
    [RESPONSE_MESSAGES.REGISTRATION_REQUIRED_FIELDS]: () =>
      !username || !password || !userId,
    [RESPONSE_MESSAGES.REGISTRATION_FIELD_TYPES]: () =>
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      typeof userId !== 'string',
    [RESPONSE_MESSAGES.USERNAME_MIN_LENGTH]: () => username.trim().length < 3,
    [RESPONSE_MESSAGES.PASSWORD_MIN_LENGTH]: () => password.length < 6,
    [RESPONSE_MESSAGES.USERID_MIN_LENGTH]: () => userId.trim().length < 3,
    [RESPONSE_MESSAGES.USERNAME_PATTERN]: () =>
      !/^[a-zA-Z0-9_]+$/.test(username.trim()),
    [RESPONSE_MESSAGES.USERID_PATTERN]: () =>
      !/^[a-zA-Z0-9_-]+$/.test(userId.trim()),
  };

  for (const [errorMessage, checkFunction] of Object.entries(
    registrationChecks
  )) {
    if (checkFunction()) {
      throw new Error(errorMessage);
    }
  }
};

export const validateLogin = (userId: string, password: string): void => {
  const loginChecks = {
    [RESPONSE_MESSAGES.LOGIN_REQUIRED_FIELDS]: () => !userId || !password,
    [RESPONSE_MESSAGES.LOGIN_FIELD_TYPES]: () =>
      typeof userId !== 'string' || typeof password !== 'string',
  };

  for (const [errorMessage, checkFunction] of Object.entries(loginChecks)) {
    if (checkFunction()) {
      throw new Error(errorMessage);
    }
  }
};

export const validateUserIdOnly = (userId: string): void => {
  const userIdChecks = {
    [RESPONSE_MESSAGES.USERID_REQUIRED]: () => !userId,
    [RESPONSE_MESSAGES.USERID_TYPE]: () => typeof userId !== 'string',
    [RESPONSE_MESSAGES.USERID_MIN_LENGTH]: () => userId.trim().length < 3,
    [RESPONSE_MESSAGES.USERID_PATTERN]: () =>
      !/^[a-zA-Z0-9_-]+$/.test(userId.trim()),
  };

  for (const [errorMessage, checkFunction] of Object.entries(userIdChecks)) {
    if (checkFunction()) {
      throw new Error(errorMessage);
    }
  }
};
