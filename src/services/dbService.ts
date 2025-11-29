import fs from 'fs';
import path from 'path';

function readJsonResource(filename: string) {
  const resourcePath = path.resolve(__dirname, '../resources', filename);
  const data = fs.readFileSync(resourcePath, 'utf-8');
  return JSON.parse(data);
}

export function getBoardData(boardId: string, version: string) {
  const filename = `board_${boardId}_${version}.json`;
  return readJsonResource(filename);
}

export function getCellsData(boardId: string, version: string) {
  const filename = `cells_${boardId}_${version}.json`;
  return readJsonResource(filename);
}
