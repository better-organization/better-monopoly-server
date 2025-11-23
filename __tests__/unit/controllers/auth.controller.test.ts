import request from 'supertest';
import app from '../../../src/app';

describe('Auth Controller - Unit Tests', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and success message when valid username is provided', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'john_doe',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Login successful',
      });
    });

    it('should return 400 when username is empty', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username cannot be empty');
    });

    it('should return 400 when username is not provided', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when username is too short (less than 3 characters)', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'ab',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when username is too long (more than 50 characters)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'a'.repeat(51),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should trim whitespace from username', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: '  john_doe  ',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Login successful',
      });
    });
  });
});
