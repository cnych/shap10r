import { useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useGameSound } from '@/hooks/useGameSound';

/**
 * 游戏控制钩子函数
 * 提供游戏的主要控制功能:取消、确认、重置和分享
 * @param canvasId - 游戏画布的DOM ID
 */
export function useGameControls(canvasId: string) {
  // 获取游戏实例和音效控制
  const { game } = useGameState(canvasId);
  const { play } = useGameSound();

  /**
   * 处理取消操作
   * 移除当前行最后放置的形状
   */
  const handleCancel = useCallback(() => {
    if (!game) return;
    // 找到当前行中最后一个非正确状态的形状
    const lastFilledIndex = game.findLastRemovableShape();
    // 如果找到的形状索引不为-1，表示有形状可以移除，则清除该形状
    if (lastFilledIndex !== -1) {  
      // 清除最后一个形状
      game.grid[game.currentRow][lastFilledIndex] = null;
      // 更新活动列位置为下一个空位置
      game.activeCol = game.findNextEmptyCell();
      // 播放移除音效
      play('remove');
      // 重绘画布
      game.draw();
      // 通知状态更新
      game.notifyStateChanged();
    }
  }, [game, play]);

  /**
   * 处理确认操作
   * 检查当前行是否已满，如果已满则检查是否获胜
   */
  const handleConfirm = useCallback(() => {
    if (!game) return;
    if (game.isRowFull(game.currentRow)) {
      game.checkWinCondition();
    }
  }, [game]);

  /**
   * 处理重置操作
   * 重置整个游戏状态
   */
  const handleReset = useCallback(() => {
    if (!game) return;
    game.resetGame();
  }, [game]);

  /**
   * 处理分享操作
   * 分享游戏结果
   */
  const handleShare = useCallback(async () => {
    if (!game) return;
    await game.shareResult();
  }, [game]);

  return {
    handleCancel,
    handleConfirm,
    handleReset,
    handleShare
  };
} 