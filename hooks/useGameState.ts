import { useState, useEffect } from 'react';
import { Game } from '@/lib/game';
import type { Shape } from '@/lib/shapes';

export function useGameState(canvasId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [currentRow, setCurrentRow] = useState(0);
  const [grid, setGrid] = useState<(Shape | null)[][]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const gameInstance = new Game(canvasId);
    setGame(gameInstance);
    setCurrentRow(gameInstance.currentRow);
    setGrid(gameInstance.grid);

    const handleGameStateChanged = () => {
      setCurrentRow(gameInstance.currentRow);
      setGrid(gameInstance.grid);
      setUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('gameStateChanged', handleGameStateChanged);

    return () => {
      window.removeEventListener('gameStateChanged', handleGameStateChanged);
    };
  }, [canvasId]);

  return {
    game,
    currentRow,
    grid,
    updateTrigger,
  };
} 