import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useGameTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // 检查系统主题
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setTheme(e.matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', e.matches);
    };

    // 初始化主题
    updateTheme(mediaQuery);

    // 监听系统主题变化
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  const toggleTheme = () => {
    setTheme(current => {
      const newTheme = current === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  };

  return { theme, toggleTheme };
} 