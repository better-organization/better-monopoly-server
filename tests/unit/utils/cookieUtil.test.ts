import { Request, Response } from 'express';
import { cookieUtil } from '../../../src/utils/cookieUtil';

describe('cookieUtil', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let cookieMock: jest.Mock;

  beforeEach(() => {
    // Reset NODE_ENV
    delete process.env['NODE_ENV'];
    delete process.env['COOKIE_DOMAIN'];

    // Setup mock request
    mockRequest = {
      cookies: {},
    };

    // Setup mock response
    cookieMock = jest.fn();
    mockResponse = {
      cookie: cookieMock,
    };

    // Clear console.log mock
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setCookie', () => {
    it('should set a cookie with correct name and value in development', () => {
      process.env['NODE_ENV'] = 'development';
      cookieUtil.setCookie(mockResponse as Response, 'test_cookie', 'test_value', 24);

      expect(cookieMock).toHaveBeenCalledWith(
        'test_cookie',
        'test_value',
        expect.any(Object)
      );
      const options = cookieMock.mock.calls[0][2];
      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe('lax');
      expect(options.secure).toBe(false);
      expect(options.path).toBe('/');
    });

    it('should set a cookie with correct name and value in production', () => {
      process.env['NODE_ENV'] = 'production';

      cookieUtil.setCookie(mockResponse as Response, 'auth_token', 'token123', 24);

      const options = cookieMock.mock.calls[0][2];
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe('none');
    });

    it('should set correct expiration time', () => {
      const hours = 24;
      const beforeTime = Date.now();

      cookieUtil.setCookie(mockResponse as Response, 'auth_token', 'token123', hours);

      const afterTime = Date.now();
      const options = cookieMock.mock.calls[0][2];
      const expiresTime = options.expires.getTime();

      // Expected expiration should be approximately hours * 60 * 60 * 1000 milliseconds from now
      const expectedMin = beforeTime + hours * 60 * 60 * 1000;
      const expectedMax = afterTime + hours * 60 * 60 * 1000;

      expect(expiresTime).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresTime).toBeLessThanOrEqual(expectedMax);
    });

    it('should handle different hour values correctly', () => {
      const testCases = [1, 12, 24, 48, 168]; // 1h, 12h, 24h, 48h, 1 week

      testCases.forEach(hours => {
        cookieMock.mockClear();
        const beforeTime = Date.now();

        cookieUtil.setCookie(mockResponse as Response, 'test', 'value', hours);

        const options = cookieMock.mock.calls[0][2];
        const expiresTime = options.expires.getTime();
        const expectedTime = beforeTime + hours * 60 * 60 * 1000;

        // Allow 1 second tolerance
        expect(Math.abs(expiresTime - expectedTime)).toBeLessThan(1000);
      });
    });
  });

  describe('getCookie', () => {
    it('should retrieve existing cookie value', () => {
      mockRequest.cookies = {
        auth_token: 'token123',
        session_id: 'session456',
      };

      const value = cookieUtil.getCookie(mockRequest as Request, 'auth_token');

      expect(value).toBe('token123');
    });

    it('should return undefined for non-existent cookie', () => {
      mockRequest.cookies = {
        auth_token: 'token123',
      };

      const value = cookieUtil.getCookie(mockRequest as Request, 'non_existent');

      expect(value).toBeUndefined();
    });

    it('should return undefined when cookies object is undefined', () => {
      mockRequest.cookies = {} as any;
      delete (mockRequest as any).cookies;

      const value = cookieUtil.getCookie(mockRequest as Request, 'auth_token');

      expect(value).toBeUndefined();
    });

    it('should handle empty cookies object', () => {
      mockRequest.cookies = {};

      const value = cookieUtil.getCookie(mockRequest as Request, 'auth_token');

      expect(value).toBeUndefined();
    });

    it('should retrieve different cookies correctly', () => {
      mockRequest.cookies = {
        cookie1: 'value1',
        cookie2: 'value2',
        cookie3: 'value3',
      };

      expect(cookieUtil.getCookie(mockRequest as Request, 'cookie1')).toBe('value1');
      expect(cookieUtil.getCookie(mockRequest as Request, 'cookie2')).toBe('value2');
      expect(cookieUtil.getCookie(mockRequest as Request, 'cookie3')).toBe('value3');
    });
  });
});

