import { RoomService } from '../../../src/services/roomService';

describe('RoomService', () => {
  let roomService: RoomService;

  beforeEach(() => {
    roomService = RoomService.getInstance();
  });

  describe('createRoom', () => {
    it('should create a room with a unique roomId and roomCode', () => {
      const username = 'testUser';

      const roomInfo = roomService.createRoom(username);

      expect(roomInfo).toBeDefined();
      expect(roomInfo.roomId).toBeDefined();
      expect(roomInfo.roomCode).toBeDefined();
      expect(roomInfo.players).toContain(username);
      expect(roomInfo.players.length).toBe(1);
    });

    it('should create room with UUID format roomId', () => {
      const username = 'player1';

      const roomInfo = roomService.createRoom(username);

      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(roomInfo.roomId).toMatch(uuidPattern);
    });

    it('should create room with 6-character roomCode', () => {
      const username = 'player1';

      const roomInfo = roomService.createRoom(username);

      expect(roomInfo.roomCode).toHaveLength(6);
    });

    it('should add the creator as the first player', () => {
      const username = 'creator123';

      const roomInfo = roomService.createRoom(username);

      expect(roomInfo.players).toEqual(['creator123']);
    });

    it('should create multiple rooms with unique roomIds', () => {
      const room1 = roomService.createRoom('user1');
      const room2 = roomService.createRoom('user2');
      const room3 = roomService.createRoom('user3');

      expect(room1.roomId).not.toBe(room2.roomId);
      expect(room1.roomId).not.toBe(room3.roomId);
      expect(room2.roomId).not.toBe(room3.roomId);
    });

    it('should create multiple rooms with unique roomCodes', () => {
      const room1 = roomService.createRoom('user1');
      const room2 = roomService.createRoom('user2');
      const room3 = roomService.createRoom('user3');

      expect(room1.roomCode).not.toBe(room2.roomCode);
      expect(room1.roomCode).not.toBe(room3.roomCode);
      expect(room2.roomCode).not.toBe(room3.roomCode);
    });
  });

  describe('getRoom', () => {
    it('should retrieve an existing room by roomId', () => {
      const username = 'testUser';
      const createdRoom = roomService.createRoom(username);

      const retrievedRoom = roomService.getRoom(createdRoom.roomCode);

      expect(retrievedRoom).toBeDefined();
      expect(retrievedRoom?.roomId).toBe(createdRoom.roomId);
      expect(retrievedRoom?.roomCode).toBe(createdRoom.roomCode);
      expect(retrievedRoom?.players).toEqual(createdRoom.players);
    });

    it('should return undefined for non-existent roomId', () => {
      const retrievedRoom = roomService.getRoom('non-existent-room-id');

      expect(retrievedRoom).toBeUndefined();
    });

    it('should return room info with all properties', () => {
      const roomInfo = roomService.createRoom('player1');

      const retrievedRoom = roomService.getRoom(roomInfo.roomCode);

      expect(retrievedRoom).toHaveProperty('roomId');
      expect(retrievedRoom).toHaveProperty('roomCode');
      expect(retrievedRoom).toHaveProperty('players');
    });

    it('should retrieve multiple different rooms correctly', () => {
      const room1 = roomService.createRoom('user1');
      const room2 = roomService.createRoom('user2');
      const room3 = roomService.createRoom('user3');

      const retrieved1 = roomService.getRoom(room1.roomCode);
      const retrieved2 = roomService.getRoom(room2.roomCode);
      const retrieved3 = roomService.getRoom(room3.roomCode);

      expect(retrieved1?.roomId).toBe(room1.roomId);
      expect(retrieved2?.roomId).toBe(room2.roomId);
      expect(retrieved3?.roomId).toBe(room3.roomId);

      expect(retrieved1?.players).toEqual(['user1']);
      expect(retrieved2?.players).toEqual(['user2']);
      expect(retrieved3?.players).toEqual(['user3']);
    });
  });

  describe('joinRoom', ()=> {
    it('should allow a user to join an existing room', () => {
      const creator = 'creatorUser';
      const joiner = 'joinerUser';
      const roomInfo = roomService.createRoom(creator);

      const joinResult = roomService.joinRoom(roomInfo.roomCode, joiner);
      const updatedRoom = roomService.getRoom(roomInfo.roomCode);

      expect(joinResult).toBe(true);
      expect(updatedRoom?.players).toContain(creator);
      expect(updatedRoom?.players).toContain(joiner);
      expect(updatedRoom?.players.length).toBe(2);
    });

    it('should not allow trying to join a non-existent room', () => {
      const joinResult = roomService.joinRoom('invalidRoomCode', 'someUser');

      expect(joinResult).toBe(false);
    });

    it('should not add the same user twice to a room', () => {
      const username = 'duplicateUser';   
      const roomInfo = roomService.createRoom(username);

      const firstJoin = roomService.joinRoom(roomInfo.roomCode, username);
      const updatedRoom = roomService.getRoom(roomInfo.roomCode);

      expect(firstJoin).toBe(false);
      expect(updatedRoom?.players).toEqual([username]);
      expect(updatedRoom?.players.length).toBe(1);
    });

    it('should allow multiple different users to join the same room', () => {
      const roomInfo = roomService.createRoom('hostUser');

      const usersToJoin = ['userA', 'userB', 'userC'];
      usersToJoin.forEach(user => {
        const joinResult = roomService.joinRoom(roomInfo.roomCode, user);
        expect(joinResult).toBe(true);
      });

      const updatedRoom = roomService.getRoom(roomInfo.roomCode);
      expect(updatedRoom?.players.length).toBe(4);
      expect(updatedRoom?.players).toContain('hostUser');
      usersToJoin.forEach(user => {
        expect(updatedRoom?.players).toContain(user);
      });
    });
  });
});

