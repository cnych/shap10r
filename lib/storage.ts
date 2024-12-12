import type { GameState as AppGameState } from '@/lib/types';

// 定义本地存储的状态类型
export interface StorageGameState extends Omit<AppGameState, 'grid'> {
  grid: Array<Array<{
    type: string;
    color: string;
    number: number;
    state: 'normal' | 'correct' | 'exists';
  } | null>>;
}

// 空的存储管理器
export const StorageManager = {
  getGameState: () => null,
  saveGameState: () => {},
  clearGameState: () => {}
}; 