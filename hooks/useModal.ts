import { useCallback } from 'react';
import { useGameSound } from '@/hooks/useGameSound';

export function useModal(modalId: string) {
  const { play } = useGameSound();
  const showModal = useCallback(() => {
    play('click');
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
    }
  }, [modalId]);

  const hideModal = useCallback(() => {
    play('click');
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }, [modalId]);

  return { showModal, hideModal };
} 