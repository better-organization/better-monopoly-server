import { Room, RoomState } from '../../../src/models/Room';
import { GAME_CONSTANTS } from '../../../src/config/gameConstants';

describe('Room Model', () => {
  jest.replaceProperty(GAME_CONSTANTS, 'MAX_PLAYERS', 4);
  describe('constructor', () => {
    it('should create a room with provided roomId and roomCode', () => {
      const roomId = 'room-123';
      const roomCode = 'ABC123';

      const room = new Room(roomId, roomCode);
      const roomInfo = room.getRoomInfo();

      expect(roomInfo.roomId).toBe(roomId);
      expect(roomInfo.roomCode).toBe(roomCode);
    });

    it('should initialize with empty players set', () => {
      const room = new Room('room-id', 'CODE01');
      const roomInfo = room.getRoomInfo();

      expect(roomInfo.players).toEqual([]);
      expect(room.getPlayerCount()).toBe(0);
    });

    it('should initialize with WAITING room state', () => {
      const room = new Room('room-id', 'CODE01');

      expect(room.getRoomState()).toBe(RoomState.WAITING);
    });

    it('should initialize with null gameId', () => {
      const room = new Room('room-id', 'CODE01');

      expect(room.getGameId()).toBeNull();
    });

    it('should initialize with maxPlayers from GAME_CONSTANTS', () => {
      const room = new Room('room-id', 'CODE01');
      const roomInfo = room.getRoomInfo();

      expect(roomInfo.maxPlayers).toBe(GAME_CONSTANTS.MAX_PLAYERS);
    });
  });

  describe('getRoomInfo', () => {
    it('should return complete room information', () => {
      const roomId = 'room-id-789';
      const roomCode = 'TEST01';
      const room = new Room(roomId, roomCode);

      room.addPlayer('player1');
      room.addPlayer('player2');

      const roomInfo = room.getRoomInfo();

      expect(roomInfo).toEqual({
        roomId: roomId,
        roomCode: roomCode,
        players: ['player1', 'player2'],
        maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
        roomState: RoomState.WAITING,
      });
    });

    it('should return room info with empty players array when no players added', () => {
      const room = new Room('room-id', 'CODE01');

      const roomInfo = room.getRoomInfo();

      expect(roomInfo).toEqual({
        roomId: 'room-id',
        roomCode: 'CODE01',
        players: [],
        maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
        roomState: RoomState.WAITING,
      });
    });

    it('should have correct structure matching roomInfo interface', () => {
      const room = new Room('room-id', 'CODE01');
      room.addPlayer('testPlayer');

      const roomInfo = room.getRoomInfo();

      expect(roomInfo).toHaveProperty('roomId');
      expect(roomInfo).toHaveProperty('roomCode');
      expect(roomInfo).toHaveProperty('players');
      expect(roomInfo).toHaveProperty('maxPlayers');
      expect(roomInfo).toHaveProperty('roomState');
      expect(typeof roomInfo.roomId).toBe('string');
      expect(typeof roomInfo.roomCode).toBe('string');
      expect(Array.isArray(roomInfo.players)).toBe(true);
      expect(typeof roomInfo.maxPlayers).toBe('number');
      expect(typeof roomInfo.roomState).toBe('string');
    });

    it('should reflect IN_GAME state after setGameId is called', () => {
      const room = new Room('room-id', 'CODE01');
      room.setGameId('game-123');

      const roomInfo = room.getRoomInfo();

      expect(roomInfo.roomState).toBe(RoomState.IN_GAME);
    });
  });

  describe('addPlayer', () => {
    it('should add a player to the room', () => {
      const room = new Room('room-id', 'CODE01');

      const isPlayerAdded = room.addPlayer('player1');

      const roomInfo = room.getRoomInfo();

      expect(isPlayerAdded).toBe(true);
      expect(roomInfo.players.length).toBe(1);
      expect(roomInfo.players).toContain('player1');
    });

    it('should add multiple players to the room', () => {
      const room = new Room('room-id', 'CODE01');

      const isFirstPlayerAdded = room.addPlayer('player1');
      const isSecondPlayerAdded = room.addPlayer('player2');
      const isThirdPlayerAdded = room.addPlayer('player3');

      const roomInfo = room.getRoomInfo();

      expect(isFirstPlayerAdded).toBe(true);
      expect(isSecondPlayerAdded).toBe(true);
      expect(isThirdPlayerAdded).toBe(true);
      expect(roomInfo.players.length).toBe(3);
      expect(roomInfo.players).toEqual(['player1', 'player2', 'player3']);
    });

    it('should not add duplicate players to the room', () => {
      const room = new Room('room-id', 'CODE01');

      const isFirstPlayerAdded = room.addPlayer('player1');
      const isDuplicatePlayerAdded = room.addPlayer('player1');

      const roomInfo = room.getRoomInfo();

      expect(isFirstPlayerAdded).toBe(true);
      expect(isDuplicatePlayerAdded).toBe(false);
      expect(roomInfo.players.length).toBe(1);
      expect(roomInfo.players).toEqual(['player1']);
    });

    it('should maintain order of players added', () => {
      const room = new Room('room-id', 'CODE01');

      room.addPlayer('player1');
      room.addPlayer('player2');
      room.addPlayer('player3');

      const roomInfo = room.getRoomInfo();

      expect(roomInfo.players).toEqual(['player1', 'player2', 'player3']);
    });
  });

  describe('setGameId', () => {
    it('should set the game ID for the room', () => {
      const room = new Room('room-id', 'CODE01');
      const gameId = 'game-uuid-123';

      room.setGameId(gameId);

      expect(room.getGameId()).toBe(gameId);
    });

    it('should change room state to IN_GAME when gameId is set', () => {
      const room = new Room('room-id', 'CODE01');

      expect(room.getRoomState()).toBe(RoomState.WAITING);

      room.setGameId('game-123');

      expect(room.getRoomState()).toBe(RoomState.IN_GAME);
    });

    it('should update room state in getRoomInfo after setGameId', () => {
      const room = new Room('room-id', 'CODE01');
      room.setGameId('game-456');

      const roomInfo = room.getRoomInfo();

      expect(roomInfo.roomState).toBe(RoomState.IN_GAME);
    });
  });

  describe('getGameId', () => {
    it('should return null when no game has been started', () => {
      const room = new Room('room-id', 'CODE01');

      expect(room.getGameId()).toBeNull();
    });

    it('should return the gameId after it has been set', () => {
      const room = new Room('room-id', 'CODE01');
      const gameId = 'game-uuid-789';

      room.setGameId(gameId);

      expect(room.getGameId()).toBe(gameId);
    });

    it('should return the correct gameId for different rooms', () => {
      const room1 = new Room('room-1', 'CODE01');
      const room2 = new Room('room-2', 'CODE02');

      room1.setGameId('game-1');
      room2.setGameId('game-2');

      expect(room1.getGameId()).toBe('game-1');
      expect(room2.getGameId()).toBe('game-2');
    });
  });

  describe('getHostId', () => {
    it('should return null when no players are in the room', () => {
      const room = new Room('room-id', 'CODE01');

      expect(room.getHostId()).toBeNull();
    });

    it('should return the first player as host', () => {
      const room = new Room('room-id', 'CODE01');

      room.addPlayer('host-player');
      room.addPlayer('second-player');
      room.addPlayer('third-player');

      expect(room.getHostId()).toBe('host-player');
    });

    it('should return the same host even after more players join', () => {
      const room = new Room('room-id', 'CODE01');
      const hostId = 'original-host';

      room.addPlayer(hostId);

      expect(room.getHostId()).toBe(hostId);

      room.addPlayer('player2');
      room.addPlayer('player3');

      expect(room.getHostId()).toBe(hostId);
    });

    it('should return the only player as host in single-player room', () => {
      const room = new Room('room-id', 'CODE01');

      room.addPlayer('solo-player');

      expect(room.getHostId()).toBe('solo-player');
    });
  });

  describe('getRoomState', () => {
    it('should return WAITING state initially', () => {
      const room = new Room('room-id', 'CODE01');

      expect(room.getRoomState()).toBe(RoomState.WAITING);
    });

    it('should return IN_GAME state after game starts', () => {
      const room = new Room('room-id', 'CODE01');

      room.setGameId('game-123');

      expect(room.getRoomState()).toBe(RoomState.IN_GAME);
    });

    it('should maintain IN_GAME state after being set', () => {
      const room = new Room('room-id', 'CODE01');

      room.setGameId('game-123');
      expect(room.getRoomState()).toBe(RoomState.IN_GAME);

      // Add more players after game started
      room.addPlayer('late-player');
      expect(room.getRoomState()).toBe(RoomState.IN_GAME);
    });
  });

  describe('getGameNumber', () => {
    it('should return 0 initially', () => {
      const room = new Room('room-id', 'CODE01');

      expect(room.getGameNumber()).toBe(0);
    });

    it('should return 1 after first game starts', () => {
      const room = new Room('room-id', 'CODE01');
      room.setGameId('game-1');

      expect(room.getGameNumber()).toBe(1);
    });

    it('should increment game number for each new game', () => {
      const room = new Room('room-id', 'CODE01');

      room.setGameId('game-1');
      expect(room.getGameNumber()).toBe(1);

      room.setGameId('game-2');
      expect(room.getGameNumber()).toBe(2);

      room.setGameId('game-3');
      expect(room.getGameNumber()).toBe(3);
    });

    it('should track game number independently for different rooms', () => {
      const room1 = new Room('room-1', 'CODE01');
      const room2 = new Room('room-2', 'CODE02');

      room1.setGameId('game-1-1');
      room1.setGameId('game-1-2');
      expect(room1.getGameNumber()).toBe(2);

      room2.setGameId('game-2-1');
      expect(room2.getGameNumber()).toBe(1);

      expect(room1.getGameNumber()).toBe(2); // Shouldn't be affected by room2
    });
  });

  describe('getPlayerCount', () => {
    it('should return 0 for empty room', () => {
      const room = new Room('room-id', 'CODE01');

      expect(room.getPlayerCount()).toBe(0);
    });

    it('should return correct count for single player', () => {
      const room = new Room('room-id', 'CODE01');

      room.addPlayer('player1');

      expect(room.getPlayerCount()).toBe(1);
    });

    it('should return correct count for multiple players', () => {
      const room = new Room('room-id', 'CODE01');

      room.addPlayer('player1');
      room.addPlayer('player2');
      room.addPlayer('player3');

      expect(room.getPlayerCount()).toBe(3);
    });

    it('should not increase count when adding duplicate player', () => {
      const room = new Room('room-id', 'CODE01');

      room.addPlayer('player1');
      expect(room.getPlayerCount()).toBe(1);

      room.addPlayer('player1');
      expect(room.getPlayerCount()).toBe(1);
    });

    it('should update count correctly as players join', () => {
      const room = new Room('room-id', 'CODE01');

      expect(room.getPlayerCount()).toBe(0);

      room.addPlayer('player1');
      expect(room.getPlayerCount()).toBe(1);

      room.addPlayer('player2');
      expect(room.getPlayerCount()).toBe(2);

      room.addPlayer('player3');
      expect(room.getPlayerCount()).toBe(3);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete room lifecycle', () => {
      const room = new Room('room-123', 'ABC123');

      // Initial state
      expect(room.getRoomState()).toBe(RoomState.WAITING);
      expect(room.getPlayerCount()).toBe(0);
      expect(room.getHostId()).toBeNull();
      expect(room.getGameId()).toBeNull();

      // Add players
      room.addPlayer('host');
      room.addPlayer('player2');

      expect(room.getPlayerCount()).toBe(2);
      expect(room.getHostId()).toBe('host');

      // Start game
      room.setGameId('game-xyz');

      expect(room.getRoomState()).toBe(RoomState.IN_GAME);
      expect(room.getGameId()).toBe('game-xyz');

      // Verify final state
      const roomInfo = room.getRoomInfo();
      expect(roomInfo.players).toEqual(['host', 'player2']);
      expect(roomInfo.roomState).toBe(RoomState.IN_GAME);
      expect(roomInfo.maxPlayers).toBe(GAME_CONSTANTS.MAX_PLAYERS);
    });

    it('should correctly handle room with max players', () => {
      const room = new Room('room-id', 'CODE01');
      const maxPlayers = GAME_CONSTANTS.MAX_PLAYERS;

      for (let i = 0; i < maxPlayers; i++) {
        room.addPlayer(`player${i}`);
      }

      expect(room.getPlayerCount()).toBe(maxPlayers);

      const roomInfo = room.getRoomInfo();
      expect(roomInfo.players.length).toBe(maxPlayers);
      expect(roomInfo.maxPlayers).toBe(maxPlayers);
    });
  });
});

