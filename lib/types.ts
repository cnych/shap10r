import type { Shape, ShapesManager } from "@/lib/shapes";


export interface GameState {
  grid: (Shape | null)[][];
  currentRow: number;
  targetNumber: number;
  solution: Solution[];
  checkedRows: boolean[];
  activeCol: number;
}

export interface Solution {
  type: string;
  color: string;
  number: number;
  position: number;
}

export interface ShapeState {
  type: string;
  color: string;
  number: number;
  state: "normal" | "correct" | "exists";
}

export interface ShapeNumber {
  shape: string;
  color: string;
  value: number;
}

export interface GameConfig {
  readonly GRID_ROWS: number;
  readonly GRID_COLS: number;
  readonly CELL_SIZE: number;
  readonly GAP_SIZE: number;
  readonly SHAPES: readonly string[];
  readonly COLORS: readonly string[];
  readonly MIN_NUMBER: number;
  readonly MAX_NUMBER: number;
}

// 用于 Game 类型的前向声明
export interface IGame {
  grid: (Shape | null)[][];
  currentRow: number;
  checkedRows: boolean[];
  activeCol: number;
  shapesManager: ShapesManager;
  findNextEmptyCell(): number;
  placeShape(shape: Shape, row: number, col: number): boolean;
  isRowFull(row: number): boolean;
  resetGame(): void;
  shareResult(): void;
  findLastRemovableShape(): number;
  draw(): void;
  checkWinCondition(): void;
  notifyStateChanged(): void;
}
