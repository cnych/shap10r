import { useCallback } from 'react';
import { GAME_CONFIG, runtimeConfig } from '@/lib/constants';

export function useGameConfig() {
  const updateCellSize = useCallback((size: number) => {
    runtimeConfig.cellSize = size;
  }, []);

  const updateGapSize = useCallback((size: number) => {
    runtimeConfig.gapSize = size;
  }, []);

  return {
    config: GAME_CONFIG,
    runtime: runtimeConfig,
    updateCellSize,
    updateGapSize
  };
} 