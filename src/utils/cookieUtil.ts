import { Request, Response } from 'express';

export class cookieUtil {
  static setCookie(res: Response, name: string, value: string, hours: number) {
    const expires = new Date(Date.now() + hours * 60 * 60 * 1000);
    const isProduction = process.env['NODE_ENV'] === 'production';
    res.cookie(name, value, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: isProduction, // HTTPS only in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin in production
      expires, // Cookie expiration date
      path: '/', // Available for all routes
      domain: process.env['COOKIE_DOMAIN'] || undefined, // Optional: for cross-subdomain cookies
    });
  }

  static getCookie(req: Request, name: string): string | undefined {
    return req.cookies?.[name];
  }
}
