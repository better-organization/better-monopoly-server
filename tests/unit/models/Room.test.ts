import { Room } from '../../../src/models/Room';

describe('Room Model', () => {
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
        players: ['player1', 'player2']
      });
    });

    it('should return room info with empty players array when no players added', () => {
      const room = new Room('room-id', 'CODE01');

      const roomInfo = room.getRoomInfo();

      expect(roomInfo).toEqual({
        roomId: 'room-id',
        roomCode: 'CODE01',
        players: []
      });
    });

    it('should have correct structure matching roomInfo interface', () => {
      const room = new Room('room-id', 'CODE01');
      room.addPlayer('testPlayer');

      const roomInfo = room.getRoomInfo();

      expect(roomInfo).toHaveProperty('roomId');
      expect(roomInfo).toHaveProperty('roomCode');
      expect(roomInfo).toHaveProperty('players');
      expect(typeof roomInfo.roomId).toBe('string');
      expect(typeof roomInfo.roomCode).toBe('string');
      expect(Array.isArray(roomInfo.players)).toBe(true);
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
  });
});

