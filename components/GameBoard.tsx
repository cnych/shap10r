'use client'

import { useEffect, useRef } from 'react'
import { useGameState } from '@/hooks/useGameState'

const GameBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { game } = useGameState('gameCanvas');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (game) {
        game.resizeCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [game]);

  return (
    <div className="relative w-full h-full">
      <canvas id="gameCanvas" ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

export default GameBoard; 