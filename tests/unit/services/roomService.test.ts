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
});

