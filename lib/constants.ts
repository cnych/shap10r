import type { GameConfig } from '@/lib/types';

// 形状状态
export const SHAPE_STATE = {
    NORMAL: 'normal',
    CORRECT: 'correct',
    EXISTS: 'exists'
} as const;

// 形状状态类型
export type ShapeStateType = typeof SHAPE_STATE[keyof typeof SHAPE_STATE];


// 基础配置
export const GAME_CONFIG: GameConfig = {
    GRID_ROWS: 10,
    GRID_COLS: 6,
    CELL_SIZE: 60,
    GAP_SIZE: 8,
    SHAPES: ['♥', '●', '■'],
    COLORS: [
        '#FF0000', // 红色
        '#FFA500', // 橙色
        '#FFFF00', // 黄色
        '#008000', // 绿色
        '#0000FF', // 蓝色
        '#800080', // 紫色
        '#222222', // 黑色
        '#808080'  // 灰色
    ],
    MIN_NUMBER: 12,
    MAX_NUMBER: 234,
} as const;

// 运行时可变配置
export const runtimeConfig = {
    cellSize: GAME_CONFIG.CELL_SIZE,
    gapSize: GAME_CONFIG.GAP_SIZE,
    buttonSize: typeof window !== 'undefined' && window.innerWidth <= 640 ? 40 : 45
}; 