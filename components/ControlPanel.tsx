'use client'

import { useGameControls } from '@/hooks/useGameControls'
import { useModal } from '@/hooks/useModal'
import { useGameTheme } from '@/hooks/useGameTheme'
import { Moon, Sun } from 'lucide-react'
import { ShapesPanel } from './ShapesPanel'

export const ControlPanel = () => {
  const { handleCancel, handleConfirm } = useGameControls('gameCanvas');
  const { showModal: showHelpModal } = useModal('helpModal');
  const { theme, toggleTheme } = useGameTheme();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary/90 backdrop-blur-sm p-4 border-t border-border control-panel">
      <div className="max-w-screen-md mx-auto flex items-center justify-between">
        {/* 左侧游戏信息 */}
        <div className="flex-none flex flex-col sm:flex-row gap-2">
          <button 
            className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-orange-500 text-primary-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="帮助"
            onClick={showHelpModal}
          >
            ?
          </button>
          <button
            className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="切换主题"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
        
        {/* 中间操作区域 */}
        <div className="flex-1 mx-4 flex items-center justify-center h-full">
          <ShapesPanel />
        </div>
        
        {/* 右侧操作按钮 */}
        <div className="flex-none flex flex-col sm:flex-row gap-2">
          <button 
            className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors text-2xl font-bold"
            aria-label="取消"
            onClick={handleCancel}
          >
            ×
          </button>
          <button 
            className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-green-500 text-primary-foreground flex items-center justify-center hover:bg-green-400 transition-colors text-2xl font-bold"
            aria-label="确认"
            onClick={handleConfirm}
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel 