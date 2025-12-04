// Simple validation with object-based checks
import { ERROR_MESSAGES } from './errorMessages';

export const validateRegistration = (
  username: string,
  password: string,
  userId: string
): void => {
  const registrationChecks = {
    [ERROR_MESSAGES.REGISTRATION_REQUIRED_FIELDS]: () =>
      !username || !password || !userId,
    [ERROR_MESSAGES.REGISTRATION_FIELD_TYPES]: () =>
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      typeof userId !== 'string',
    [ERROR_MESSAGES.USERNAME_MIN_LENGTH]: () => username.trim().length < 3,
    [ERROR_MESSAGES.PASSWORD_MIN_LENGTH]: () => password.length < 6,
    [ERROR_MESSAGES.USERID_MIN_LENGTH]: () => userId.trim().length < 3,
    [ERROR_MESSAGES.USERNAME_PATTERN]: () =>
      !/^[a-zA-Z0-9_]+$/.test(username.trim()),
    [ERROR_MESSAGES.USERID_PATTERN]: () =>
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
    [ERROR_MESSAGES.LOGIN_REQUIRED_FIELDS]: () => !userId || !password,
    [ERROR_MESSAGES.LOGIN_FIELD_TYPES]: () =>
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
    [ERROR_MESSAGES.USERID_REQUIRED]: () => !userId,
    [ERROR_MESSAGES.USERID_TYPE]: () => typeof userId !== 'string',
    [ERROR_MESSAGES.USERID_MIN_LENGTH]: () => userId.trim().length < 3,
    [ERROR_MESSAGES.USERID_PATTERN]: () =>
      !/^[a-zA-Z0-9_-]+$/.test(userId.trim()),
  };

  for (const [errorMessage, checkFunction] of Object.entries(userIdChecks)) {
    if (checkFunction()) {
      throw new Error(errorMessage);
    }
  }
};
