import GameBoard from '@/components/GameBoard'
import ControlPanel from '@/components/ControlPanel'
import GameOverModal from '@/components/modals/GameOverModal'
import HelpModal from '@/components/modals/HelpModal'

export default function Home() {
  return (
    <main className="min-h-screen bg-primary">
      <div className="relative">
        <div className="w-full max-w-screen-md mx-auto px-4 pt-4 pb-[calc(theme(spacing.4)*10+theme(spacing.10)+theme(spacing.16))]">
          <div className="relative w-full" style={{ aspectRatio: '6/10' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <GameBoard />
            </div>
          </div>
        </div>

        <ControlPanel />
      </div>
      
      <GameOverModal />
      <HelpModal />
    </main>
  )
} 