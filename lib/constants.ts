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
        '#FF3B30', // 鲜艳红色
        '#FF9500', // 明亮橙色
        '#FFCC00', // 金黄色
        '#34C759', // 翠绿色
        '#007AFF', // 天蓝色
        '#AF52DE', // 亮紫色
        '#5856D6', // 靛蓝色
        '#8E8E93'  // 中性灰色
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