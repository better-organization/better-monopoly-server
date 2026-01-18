import { Request, Response } from 'express';
import { RoomService } from '../services/roomService';
import { tokenUtil } from '../utils/TokenUtil';
import { cookieUtil } from '../utils/cookieUtil';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';

export class RoomController {
  private roomService: RoomService;

  constructor(roomService: RoomService) {
    this.roomService = roomService;
    this.createRoom = this.createRoom.bind(this);
    this.roomStatus = this.roomStatus.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
  }

  createRoom(req: Request, res: Response): void {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: RESPONSE_MESSAGES.REQUIRED_PROPERTY_NOT_FOUND_IN_TOKEN,
      });
      return;
    }

    const room = this.roomService.createRoom(userId);

    // Implementation for creating a room
    if (!room) {
      res.status(500).json({
        success: false,
        message: RESPONSE_MESSAGES.ROOM_CREATION_FAILED,
      });
      return;
    }

    const currentToken = cookieUtil.getCookie(req, 'auth_token');
    if (currentToken) {
      const newToken = tokenUtil.updateRoomCode(currentToken, room.roomCode);
      cookieUtil.setCookie(res, 'auth_token', newToken, 24);
    }

    res.status(201).json({
      success: true,
      message: RESPONSE_MESSAGES.ROOM_CREATED_SUCCESSFULLY,
      data: { roomCode: room.roomCode},
    });
  }

  roomStatus(req: Request, res: Response): void {
    const roomCode = req.user?.roomCode;
    const userId = req.user?.userId;

    if (!userId || !roomCode) {
      res.status(400).json({
        success: false,
        message: RESPONSE_MESSAGES.REQUIRED_PROPERTY_NOT_FOUND_IN_TOKEN,
      });
      return;
    }

    const roomStatus = this.roomService.getRoom(roomCode);

    if (!roomStatus) {
      res.status(404).json({
        success: false,
        message: RESPONSE_MESSAGES.ROOM_NOT_FOUND,
      });
      return;
    }

    roomStatus.user = userId;
    res.status(200).json({
      data: roomStatus,
      success: true,
      message: RESPONSE_MESSAGES.ROOM_STATUS_RETRIEVED_SUCCESSFULLY,
    });
  }

  joinRoom(req: Request, res: Response): void {
    const roomCode = req.body?.roomCode;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: RESPONSE_MESSAGES.REQUIRED_PROPERTY_NOT_FOUND_IN_TOKEN,
      });
      return;
    }

    if (!roomCode) {
      res.status(400).json({
        success: false,
        message: RESPONSE_MESSAGES.REQUIRED_PROPERTY_NOT_FOUND_IN_REQUEST,
      });
      return;
    }

    try {
      const success = this.roomService.joinRoom(roomCode, userId);

      console.log(
        'Join result: ',
        success,
        'for user:',
        userId,
        'to room:',
        roomCode
      );
      const statusCode = success ? 200 : 400;
      const message = success
        ? RESPONSE_MESSAGES.ROOM_JOINED_SUCCESSFULLY
        : RESPONSE_MESSAGES.ROOM_JOIN_FAILED;

      if (success) {
        const currentToken = cookieUtil.getCookie(req, 'auth_token');
        if (currentToken) {
          const newToken = tokenUtil.updateRoomCode(currentToken, roomCode);
          cookieUtil.setCookie(res, 'auth_token', newToken, 24);
        }
      }

      res.status(statusCode).json({ success, message });
    } catch (error) {
      console.error('Error joining room:', error);

      res.status(500).json({
        success: false,
        message: RESPONSE_MESSAGES.ROOM_JOIN_ERROR,
      });
      return;
    }
  }
}
