import { User } from '../src/models/User';
import { AuthData } from '../src/models/AuthData';
import { UserData } from '../src/models/UserData';

describe('User Model - MongoDB with Separate Collections', () => {
  // Cleanup: Clear database after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create a new user with auto-generated uniqueID', async () => {
      const user = await User.createUser(
        'testuser',
        'hashedpassword',
        'custom-user-id'
      );

      expect(user.username).toBe('testuser');
      expect(user.passwordHash).toBe('hashedpassword');
      expect(user.userId).toBe('custom-user-id');
      expect(user.uniqueID).toBeDefined();
      expect(user.uniqueID).toMatch(/^[A-Z0-9]{10}$/);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should generate unique uniqueIDs for multiple users', async () => {
      const user1 = await User.createUser('user1', 'hash1', 'userId1');
      const user2 = await User.createUser('user2', 'hash2', 'userId2');

      expect(user1.uniqueID).not.toBe(user2.uniqueID);
      expect(user1.uniqueID).toMatch(/^[A-Z0-9]{10}$/);
      expect(user2.uniqueID).toMatch(/^[A-Z0-9]{10}$/);
    });

    it('should trim whitespace from username and userId', async () => {
      const user = await User.createUser('  testuser  ', 'hash', '  userId  ');

      expect(user.username).toBe('testuser');
      expect(user.userId).toBe('userId');
    });

    it('should fail to create user with duplicate userId', async () => {
      await User.createUser('user1', 'hash1', 'duplicate-id');

      await expect(
        User.createUser('user2', 'hash2', 'duplicate-id')
      ).rejects.toThrow();
    });

    it('should fail to create user with userId less than 3 characters', async () => {
      await expect(User.createUser('user', 'hash', 'ab')).rejects.toThrow();
    });

    it('should fail to create user with userId more than 50 characters', async () => {
      const longUserId = 'a'.repeat(51);
      await expect(
        User.createUser('user', 'hash', longUserId)
      ).rejects.toThrow();
    });

    it('should fail to create user with username less than 3 characters', async () => {
      await expect(User.createUser('ab', 'hash', 'userId')).rejects.toThrow();
    });

    it('should fail to create user with username more than 30 characters', async () => {
      const longUsername = 'a'.repeat(31);
      await expect(
        User.createUser(longUsername, 'hash', 'userId')
      ).rejects.toThrow();
    });
  });

  describe('UserId Existence Check', () => {
    it('should return false for non-existent userId', async () => {
      const exists = await User.userIdExists('nonexistent');
      expect(exists).toBe(false);
    });

    it('should return true for existing userId', async () => {
      await User.createUser('testuser', 'hash', 'test-user-id');
      const exists = await User.userIdExists('test-user-id');
      expect(exists).toBe(true);
    });
  });

  describe('User Lookup', () => {
    it('should find user by userId', async () => {
      await User.createUser('testuser', 'hashedpass', 'test-user-id');
      const user = await User.findByUserId('test-user-id');

      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
      expect(user?.userId).toBe('test-user-id');
      expect(user?.passwordHash).toBe('hashedpass');
    });

    it('should find user by uniqueID', async () => {
      const createdUser = await User.createUser(
        'testuser',
        'hashedpass',
        'test-user-id'
      );
      const user = await User.findByUniqueID(createdUser.uniqueID);

      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
      expect(user?.userId).toBe('test-user-id');
      expect(user?.uniqueID).toBe(createdUser.uniqueID);
    });

    it('should return null for non-existent userId', async () => {
      const user = await User.findByUserId('nonexistent');
      expect(user).toBeNull();
    });

    it('should return null for non-existent uniqueID', async () => {
      const user = await User.findByUniqueID('NONEXIST99');
      expect(user).toBeNull();
    });
  });

  describe('Public Object Method', () => {
    it('should return user data without password hash from UserData', async () => {
      const user = await User.createUser(
        'testuser',
        'hashedpass',
        'test-user-id'
      );

      // Get userData from UserData model
      const userData = await UserData.findByUniqueID(user.uniqueID);
      const publicData = userData?.toPublicObject();

      expect(publicData).toEqual({
        uniqueID: user.uniqueID,
        userId: 'test-user-id',
        username: 'testuser',
        experiencePoints: 0,
        level: 1,
        avatarUrl: undefined,
        createdAt: userData?.createdAt,
        updatedAt: userData?.updatedAt,
      });

      expect(publicData).not.toHaveProperty('passwordHash');
      expect(publicData).not.toHaveProperty('password_hash');
      expect(publicData).not.toHaveProperty('_id');
    });
  });

  describe('uniqueID Generation', () => {
    it('should generate uniqueID with correct format', async () => {
      const uniqueID = await User.generateUniqueID();
      expect(uniqueID).toMatch(/^[A-Z0-9]{10}$/);
      expect(uniqueID.length).toBe(10);
    });

    it('should generate different uniqueIDs', async () => {
      const id1 = await User.generateUniqueID();
      const id2 = await User.generateUniqueID();
      const id3 = await User.generateUniqueID();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });

  describe('Mongoose Validation', () => {
    it('should enforce required fields in AuthData', async () => {
      const authData = new AuthData({});
      await expect(authData.save()).rejects.toThrow();
    });

    it('should enforce required fields in UserData', async () => {
      const userData = new UserData({});
      await expect(userData.save()).rejects.toThrow();
    });

    it('should enforce uniqueID format', async () => {
      const authData = new AuthData({
        uniqueID: 'invalid',
        userId: 'testId',
        passwordHash: 'hash',
      });
      await expect(authData.save()).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const user = await User.createUser('testuser', 'hash', 'userId');

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        user.updatedAt.getTime()
      );
    });
  });

  describe('Separate Collections Architecture', () => {
    it('should store credentials in auth_data collection', async () => {
      const user = await User.createUser('testuser', 'hashedpass', 'userId123');

      // Check auth_data collection
      const authData = await AuthData.findByUniqueID(user.uniqueID);
      expect(authData).toBeTruthy();
      expect(authData?.uniqueID).toBe(user.uniqueID);
      expect(authData?.userId).toBe('userId123');
      expect(authData?.passwordHash).toBe('hashedpass');
    });

    it('should store user info in user_data collection without password', async () => {
      const user = await User.createUser('testuser', 'hashedpass', 'userId123');

      // Check user_data collection
      const userData = await UserData.findByUniqueID(user.uniqueID);
      expect(userData).toBeTruthy();
      expect(userData?.uniqueID).toBe(user.uniqueID);
      expect(userData?.userId).toBe('userId123');
      expect(userData?.username).toBe('testuser');
      expect(userData).not.toHaveProperty('passwordHash');
    });

    it('should link both collections with same uniqueID', async () => {
      const user = await User.createUser('testuser', 'hashedpass', 'userId123');

      const [authData, userData] = await Promise.all([
        AuthData.findByUniqueID(user.uniqueID),
        UserData.findByUniqueID(user.uniqueID),
      ]);

      expect(authData?.uniqueID).toBe(userData?.uniqueID);
      expect(authData?.userId).toBe(userData?.userId);
    });

    it('should retrieve combined user data correctly', async () => {
      await User.createUser('testuser', 'hashedpass', 'userId123');

      const user = await User.findByUserId('userId123');
      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
      expect(user?.passwordHash).toBe('hashedpass');
      expect(user?.uniqueID).toBeDefined();
    });
  });
});
