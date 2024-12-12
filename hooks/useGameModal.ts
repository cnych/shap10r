import { create } from 'zustand';
import type { Solution } from '@/lib/types';

type ModalType = 'tip' | 'win' | 'loss' | null;
type MessageType = string | { type: 'correct-answer', solution: Solution[] | null };

interface GameModalState {
  isOpen: boolean;
  type: ModalType;
  message: MessageType;
  title: string;
  showShare: boolean;
  showRestart: boolean;
  buttonText: string;
  onShare?: () => void;
  onRestart?: () => void;
  setModal: (params: Partial<Omit<GameModalState, 'setModal' | 'closeModal'>>) => void;
  closeModal: () => void;
}

export const useGameModal = create<GameModalState>((set) => ({
  isOpen: false,
  type: null,
  message: '',
  title: '',
  showShare: false,
  showRestart: true,
  buttonText: 'OK',
  setModal: (params) => set({ isOpen: true, ...params }),
  closeModal: () => set({ isOpen: false, type: null }),
})); 