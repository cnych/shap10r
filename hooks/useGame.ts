import { useEffect, useRef } from 'react';
import { Game } from '@/lib/game';

export function useGame(canvasId: string) {
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Game(canvasId);
    }

    return () => {
      // 清理代码（如果需要）
    };
  }, [canvasId]);

  return gameRef.current;
} 