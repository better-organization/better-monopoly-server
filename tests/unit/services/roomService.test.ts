import { RoomService } from '../../../src/services/roomService';
import { GameService } from '../../../src/services/gameService';
import { GAME_CONSTANTS } from '../../../src/config/gameConstants';
import { RoomState } from '../../../src/models/Room';

// Mock GameService
jest.mock('../../../src/services/gameService');

describe('RoomService', () => {
  let roomService: RoomService;

  beforeEach(() => {
    jest.replaceProperty(GAME_CONSTANTS, 'MAX_PLAYERS', 4);
    roomService = RoomService.getInstance();
    // Clear storage before each test
    roomService.clearStorage();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    roomService.clearStorage();
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

  describe('clearStorage', () => {
    it('should clear all rooms from storage', () => {
      const room1 = roomService.createRoom('user1');
      const room2 = roomService.createRoom('user2');
      const room3 = roomService.createRoom('user3');

      expect(roomService.getRoom(room1.roomCode)).toBeDefined();
      expect(roomService.getRoom(room2.roomCode)).toBeDefined();
      expect(roomService.getRoom(room3.roomCode)).toBeDefined();

      roomService.clearStorage();

      expect(roomService.getRoom(room1.roomCode)).toBeUndefined();
      expect(roomService.getRoom(room2.roomCode)).toBeUndefined();
      expect(roomService.getRoom(room3.roomCode)).toBeUndefined();
    });

    it('should allow creating new rooms after clearing', () => {
      const room1 = roomService.createRoom('user1');
      roomService.clearStorage();

      const room2 = roomService.createRoom('user2');

      expect(roomService.getRoom(room1.roomCode)).toBeUndefined();
      expect(roomService.getRoom(room2.roomCode)).toBeDefined();
    });

    it('should clear rooms accessed by both roomCode and roomId', () => {
      const room = roomService.createRoom('user1');

      roomService.clearStorage();

      expect(roomService.getRoom(room.roomCode)).toBeUndefined();
    });
  });

  describe('startGame', () => {
    beforeEach(() => {
      // Mock GameService.createGame
      (GameService.createGame as jest.Mock) = jest.fn().mockResolvedValue({
        id: 'game-uuid-123',
        players: [],
        currentPlayer: 0,
        status: 'active',
        board: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('should successfully start game when all validations pass', async () => {
      const roomInfo = roomService.createRoom('host');
      roomService.joinRoom(roomInfo.roomCode, 'player2');

      const result = await roomService.startGame(roomInfo.roomCode, 'host');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Game started successfully');
      expect(result.gameId).toBeDefined();
      expect(GameService.createGame).toHaveBeenCalledWith(['host', 'player2']);
    });

    it('should update room state to IN_GAME after starting', async () => {
      const roomInfo = roomService.createRoom('host');
      roomService.joinRoom(roomInfo.roomCode, 'player2');

      await roomService.startGame(roomInfo.roomCode, 'host');

      const updatedRoom = roomService.getRoom(roomInfo.roomCode);
      expect(updatedRoom?.roomState).toBe(RoomState.IN_GAME);
    });

    it('should return error when room does not exist', async () => {
      const result = await roomService.startGame('invalid-code', 'host');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Room not found');
      expect(GameService.createGame).not.toHaveBeenCalled();
    });

    it('should return error when user is not the host', async () => {
      const roomInfo = roomService.createRoom('host');
      roomService.joinRoom(roomInfo.roomCode, 'player2');

      const result = await roomService.startGame(roomInfo.roomCode, 'player2');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Only the room host can start the game');
      expect(GameService.createGame).not.toHaveBeenCalled();
    });

    it('should return error when game has already started', async () => {
      const roomInfo = roomService.createRoom('host');
      roomService.joinRoom(roomInfo.roomCode, 'player2');

      // Start game first time
      await roomService.startGame(roomInfo.roomCode, 'host');

      // Try to start again
      const result = await roomService.startGame(roomInfo.roomCode, 'host');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Game has already started');
    });

    it('should return error when not enough players', async () => {
      const roomInfo = roomService.createRoom('host');

      const result = await roomService.startGame(roomInfo.roomCode, 'host');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough players');
      expect(GameService.createGame).not.toHaveBeenCalled();
    });

    it('should allow starting game with minimum players', async () => {
      const roomInfo = roomService.createRoom('host');

      // Add players to meet minimum requirement
      for (let i = 1; i < GAME_CONSTANTS.MIN_PLAYERS; i++) {
        roomService.joinRoom(roomInfo.roomCode, `player${i}`);
      }

      const result = await roomService.startGame(roomInfo.roomCode, 'host');

      expect(result.success).toBe(true);
      expect(GameService.createGame).toHaveBeenCalled();
    });

    it('should allow starting game with maximum players', async () => {
      const roomInfo = roomService.createRoom('host');

      // Add players to reach maximum
      for (let i = 1; i < GAME_CONSTANTS.MAX_PLAYERS; i++) {
        roomService.joinRoom(roomInfo.roomCode, `player${i}`);
      }

      const result = await roomService.startGame(roomInfo.roomCode, 'host');

      expect(result.success).toBe(true);
      expect(GameService.createGame).toHaveBeenCalled();
    });

    it('should set gameId in room after successful start', async () => {
      const mockGameId = 'game-uuid-456';
      (GameService.createGame as jest.Mock).mockResolvedValueOnce({
        id: mockGameId,
        players: [],
        currentPlayer: 0,
        status: 'active',
        board: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const roomInfo = roomService.createRoom('host');
      roomService.joinRoom(roomInfo.roomCode, 'player2');

      const result = await roomService.startGame(roomInfo.roomCode, 'host');

      expect(result.gameId).toBe(mockGameId);
    });

    it('should pass all player IDs to GameService.createGame', async () => {
      const roomInfo = roomService.createRoom('host');
      roomService.joinRoom(roomInfo.roomCode, 'player2');
      roomService.joinRoom(roomInfo.roomCode, 'player3');

      await roomService.startGame(roomInfo.roomCode, 'host');

      expect(GameService.createGame).toHaveBeenCalledWith(
        expect.arrayContaining(['host', 'player2', 'player3'])
      );
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = RoomService.getInstance();
      const instance2 = RoomService.getInstance();
      const instance3 = RoomService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should maintain state across getInstance calls', () => {
      const instance1 = RoomService.getInstance();
      const room = instance1.createRoom('testUser');

      const instance2 = RoomService.getInstance();
      const retrievedRoom = instance2.getRoom(room.roomCode);

      expect(retrievedRoom).toBeDefined();
      expect(retrievedRoom?.roomId).toBe(room.roomId);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete room lifecycle from creation to game start', async () => {
      // Create room
      const roomInfo = roomService.createRoom('host');
      expect(roomInfo.players).toEqual(['host']);
      expect(roomInfo.roomState).toBe(RoomState.WAITING);

      // Join room
      const joinResult = roomService.joinRoom(roomInfo.roomCode, 'player2');
      expect(joinResult).toBe(true);

      // Verify room state
      const beforeGame = roomService.getRoom(roomInfo.roomCode);
      expect(beforeGame?.players).toEqual(['host', 'player2']);
      expect(beforeGame?.roomState).toBe(RoomState.WAITING);

      // Start game
      const startResult = await roomService.startGame(roomInfo.roomCode, 'host');
      expect(startResult.success).toBe(true);

      // Verify final state
      const afterGame = roomService.getRoom(roomInfo.roomCode);
      expect(afterGame?.roomState).toBe(RoomState.IN_GAME);
    });

    it('should handle multiple rooms simultaneously', async () => {
      (GameService.createGame as jest.Mock) = jest.fn().mockResolvedValueOnce({
        id: 'game-uuid-123',
        players: [],
        currentPlayer: 0,
        status: 'active',
        board: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }).mockReturnValueOnce({
        id: 'game-uuid-456',
        players: [],
        currentPlayer: 0,
        status: 'active',
        board: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        });

      const room1 = roomService.createRoom('host1');
      const room2 = roomService.createRoom('host2');

      roomService.joinRoom(room1.roomCode, 'player1-2');
      roomService.joinRoom(room2.roomCode, 'player2-2');

      const start1 = await roomService.startGame(room1.roomCode, 'host1');
      const start2 = await roomService.startGame(room2.roomCode, 'host2');

      expect(start1.success).toBe(true);
      expect(start2.success).toBe(true);
      expect(start1.gameId).not.toBe(start2.gameId);

      const finalRoom1 = roomService.getRoom(room1.roomCode);
      const finalRoom2 = roomService.getRoom(room2.roomCode);

      expect(finalRoom1?.roomState).toBe(RoomState.IN_GAME);
      expect(finalRoom2?.roomState).toBe(RoomState.IN_GAME);
    });

    it('should prevent non-host from starting game even after host leaves conceptually', async () => {
      const roomInfo = roomService.createRoom('host');
      roomService.joinRoom(roomInfo.roomCode, 'player2');
      roomService.joinRoom(roomInfo.roomCode, 'player3');

      // Only the first player (host) can start
      const result = await roomService.startGame(roomInfo.roomCode, 'player2');

      expect(result.success).toBe(false);
      expect(result.message).toContain('host');
    });

    it('should maintain room code uniqueness across many rooms', () => {
      const codes = new Set<string>();
      const numberOfRooms = 100;

      for (let i = 0; i < numberOfRooms; i++) {
        const room = roomService.createRoom(`user${i}`);
        codes.add(room.roomCode);
      }

      expect(codes.size).toBe(numberOfRooms);
    });
  });
});

