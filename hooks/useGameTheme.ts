'use client'

import { useTheme } from 'next-themes'

export const useGameTheme = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return {
    theme,
    toggleTheme,
  }
} 