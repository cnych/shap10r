'use client'

import { useCallback } from 'react';

type SoundType = 'pop' | 'check' | 'win' | 'lose' | 'wrong' | 'remove' | 'click';

const soundFiles: Record<SoundType, string> = {
  pop: '/sounds/pop.mp3',
  check: '/sounds/check.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
  wrong: '/sounds/wrong.mp3',
  remove: '/sounds/remove.mp3',
  click: '/sounds/click.mp3'
};

export function useGameSound() {
  const play = useCallback((type: SoundType) => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') return;

    try {
      const audio = new Audio(soundFiles[type]);
      audio.volume = 0.5;  // 设置音量为 50%
      audio.play().catch(err => {
        // 忽略用户未进行交互时的自动播放错误
        if (err.name !== 'NotAllowedError') {
          console.error('Failed to play sound:', err);
        }
      });
    } catch (err) {
      console.error('Failed to create Audio:', err);
    }
  }, []);

  return { play };
} 