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

  private static toMap(obj: unknown): Map<string, number> | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    if (obj instanceof Map) return obj;
    return new Map(Object.entries(obj as Record<string, number>));
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
        ...(this.toMap(property_details?.house_rent) !== undefined
          ? {
              house_rent: this.toMap(property_details!.house_rent) as Map<
                string,
                number
              >,
            }
          : {}),
        ...(this.toMap(transport_details?.transport_rent) !== undefined
          ? {
              transport_rent: this.toMap(
                transport_details!.transport_rent
              ) as Map<string, number>,
            }
          : {}),
        ...(this.toMap(utility_details?.utility_rent_multiplier) !== undefined
          ? {
              utility_rent_multiplier: this.toMap(
                utility_details!.utility_rent_multiplier
              ) as Map<string, number>,
            }
          : {}),
        ...(utility_details?.property_price !== undefined
          ? { utility_price: utility_details.property_price }
          : {}),
      };
    });
  }
}
