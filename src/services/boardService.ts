import { getBoardData, getCellsData } from './dbService';
import { Board, Cell, FlattenedCell } from '../models/Board';

export class BoardService {
  static async getBoardLayout(
    boardId: string,
    version: string
  ): Promise<Board | null> {
    let board: Board;
    let allCells: Cell[];
    try {
      board = getBoardData(boardId, version);
      allCells = getCellsData(boardId, version);
      board.cells = this.flattenCells(allCells);
    } catch {
      return null;
    }

    if (board.id !== boardId || board.version !== version) {
      return null;
    }

    return board;
  }

  static flattenCells(cells: Cell[]): FlattenedCell[] {
    return cells.map(cell => {
      const {
        special_details,
        property_details,
        utility_details,
        transport_details,
        ...rest
      } = cell;
      return {
        ...rest,
        ...special_details,
        ...property_details,
        ...utility_details,
        ...transport_details,
      };
    });
  }
}
