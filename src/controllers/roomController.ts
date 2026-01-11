import { Request, Response } from 'express';
import { RoomService } from '../services/roomService';
import { Token } from '../models/Token';
import { cookieUtil } from '../utils/cookieUtil';

export class RoomController {
  private roomService: RoomService;

  constructor(roomService: RoomService) {
    this.roomService = roomService;
    this.createRoom = this.createRoom.bind(this);
    this.roomStatus = this.roomStatus.bind(this);
  }

  createRoom(req: Request, res: Response): void {
    const username = req.user?.username;

    if (!username) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Username not found in authentication token',
      });
      return;
    }

    const room = this.roomService.createRoom(username);

    // Implementation for creating a room
    const statusCode = room ? 201 : 500;
    const message = room
      ? 'Room created successfully'
      : 'Failed to create room';

    if (!room) {
      res.status(statusCode).json({ message });
      return;
    }

    const currentToken = cookieUtil.getCookie(req, 'auth_token');
    if (currentToken) {
      const newToken = Token.updateRoomCode(currentToken, room.roomCode);
      cookieUtil.setCookie(res, 'auth_token', newToken, 24);
    }

    res.status(statusCode).json({ message, roomCode: room.roomCode });
  }

  roomStatus(req: Request, res: Response): void {
    const roomCode = req.user?.roomCode;
    const username = req.user?.username;

    if (!username) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'username not found in authentication token',
      });
      return;
    }

    if (!roomCode) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'roomCode not found in authentication token',
      });
      return;
    }

    const roomStatus = this.roomService.getRoom(roomCode);

    if (!roomStatus) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Room not found',
      });
      return;
    }

    res.status(200).json(roomStatus);
  }
}
