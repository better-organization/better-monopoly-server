import { User } from '../src/models/User';

describe('User Model', () => {
  beforeEach(() => {
    User.clearStorage();
  });

  describe('User Creation', () => {
    it('should create a new user with custom userId', () => {
      const user = User.create('testuser', 'hashedpassword', 'custom-user-id');
      
      expect(user.username).toBe('testuser');
      expect(user.password_hash).toBe('hashedpassword');
      expect(user.userId).toBe('custom-user-id');
      expect(user.id).toBe(1); // First user gets ID 1
    });

    it('should auto-increment user IDs', () => {
      const user1 = User.create('user1', 'hash1', 'userId1');
      const user2 = User.create('user2', 'hash2', 'userId2');
      
      expect(user1.id).toBe(1);
      expect(user2.id).toBe(2);
    });
  });

  describe('Username Existence Check', () => {
    it('should return false for non-existent username', () => {
      expect(User.usernameExists('nonexistent')).toBe(false);
    });

    it('should return true for existing username', () => {
      User.create('testuser', 'hash', 'userId');
      expect(User.usernameExists('testuser')).toBe(true);
    });

    it('should be case sensitive', () => {
      User.create('testuser', 'hash', 'userId');
      expect(User.usernameExists('TestUser')).toBe(false);
    });
  });

  describe('UserId Existence Check', () => {
    it('should return false for non-existent userId', () => {
      expect(User.userIdExists('nonexistent')).toBe(false);
    });

    it('should return true for existing userId', () => {
      User.create('testuser', 'hash', 'test-user-id');
      expect(User.userIdExists('test-user-id')).toBe(true);
    });
  });

  describe('User Lookup', () => {
    beforeEach(() => {
      User.create('testuser', 'hashedpass', 'test-user-id');
    });

    it('should find user by username', () => {
      const user = User.findByUsername('testuser');
      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
      expect(user?.userId).toBe('test-user-id');
    });

    it('should find user by userId', () => {
      const user = User.findByUserId('test-user-id');
      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
      expect(user?.userId).toBe('test-user-id');
    });

    it('should return null for non-existent username', () => {
      const user = User.findByUsername('nonexistent');
      expect(user).toBeNull();
    });

    it('should return null for non-existent userId', () => {
      const user = User.findByUserId('nonexistent');
      expect(user).toBeNull();
    });
  });

  describe('Public Object Method', () => {
    it('should return user data without password hash', () => {
      const user = User.create('testuser', 'hashedpass', 'test-user-id');
      const publicData = user.toPublicObject();
      
      expect(publicData).toEqual({
        id: 1,
        userId: 'test-user-id',
        username: 'testuser'
      });
      
      expect(publicData).not.toHaveProperty('password_hash');
    });
  });

  describe('Storage Management', () => {
    it('should return all users', () => {
      User.create('user1', 'hash1', 'userId1');
      User.create('user2', 'hash2', 'userId2');
      
      const allUsers = User.getAllUsers();
      expect(allUsers).toHaveLength(2);
      expect(allUsers[0]!.username).toBe('user1');
      expect(allUsers[1]!.username).toBe('user2');
    });

    it('should clear storage completely', () => {
      User.create('user1', 'hash1', 'userId1');
      User.create('user2', 'hash2', 'userId2');
      
      expect(User.getAllUsers()).toHaveLength(2);
      
      User.clearStorage();
      
      expect(User.getAllUsers()).toHaveLength(0);
      expect(User.usernameExists('user1')).toBe(false);
      expect(User.userIdExists('userId1')).toBe(false);
    });

    it('should reset ID counter after clearing', () => {
      User.create('user1', 'hash1', 'userId1');
      const allUsers = User.getAllUsers();
      expect(allUsers[0]!.id).toBe(1);
      
      User.clearStorage();
      
      const newUser = User.create('user2', 'hash2', 'userId2');
      expect(newUser.id).toBe(1); // ID should reset to 1
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty storage gracefully', () => {
      expect(User.getAllUsers()).toHaveLength(0);
      expect(User.findByUsername('anyone')).toBeNull();
      expect(User.findByUserId('anyone')).toBeNull();
      expect(User.usernameExists('anyone')).toBe(false);
      expect(User.userIdExists('anyone')).toBe(false);
    });

    it('should handle multiple users with same username pattern', () => {
      User.create('user', 'hash1', 'userId1');
      User.create('user1', 'hash2', 'userId2');
      User.create('user2', 'hash3', 'userId3');
      
      expect(User.usernameExists('user')).toBe(true);
      expect(User.usernameExists('user1')).toBe(true);
      expect(User.usernameExists('user2')).toBe(true);
      expect(User.usernameExists('user3')).toBe(false);
    });
  });
});
