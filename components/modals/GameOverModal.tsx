'use client'

import { useGameState } from '@/hooks/useGameState'
import { useModal } from '@/hooks/useModal'

const GameOverModal = () => {
  const { game, currentRow } = useGameState('gameCanvas');
  const { hideModal } = useModal('gameOverModal');

  const handleRestart = () => {
    hideModal();
    game?.resetGame();
  };

  const handleShare = () => {
    game?.shareResult();
  };

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm hidden"
      id="gameOverModal" 
      role="dialog" 
      aria-modal="true"
    >
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">游戏结束</h2>
          <p className="text-lg mb-4">
            步数: <span className="font-bold">{currentRow + 1}</span>
          </p>
          <div className="text-muted-foreground mb-6"></div>
          <div className="flex gap-4 justify-end">
            <button 
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              onClick={handleRestart}
            >
              重新开始
            </button>
            <button 
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={handleShare}
            >
              分享给朋友
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameOverModal 