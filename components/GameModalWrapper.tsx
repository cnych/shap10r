'use client'

import { GameModal } from '@/components/modals/GameModal'
import { useGameModal } from '@/hooks/useGameModal'

export const GameModalWrapper = () => {
  const { 
    isOpen, 
    title, 
    message, 
    showShare, 
    showRestart, 
    buttonText, 
    onShare, 
    onRestart,
    shareImage,
  } = useGameModal();

  return (
    <GameModal
      isOpen={isOpen}
      title={title}
      message={message}
      showShare={showShare}
      showRestart={showRestart}
      buttonText={buttonText}
      onShare={onShare}
      onRestart={onRestart}
      shareImage={shareImage}
    />
  );
}; 