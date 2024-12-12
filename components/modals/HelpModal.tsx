'use client'

import { useModal } from '@/hooks/useModal'

const HelpModal = () => {
  const { hideModal } = useModal('helpModal');

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm hidden" id="helpModal">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <div className="space-y-4 mb-6">
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Find the correct Shaplors (shape and color) that add up to the number on the right</li>
              <li>Yellow border indicates that this Shaplor is part of the answer but in the wrong position</li>
              <li>Green border indicates that this Shaplor is in the correct position</li>
              <li>Use the cancel button (×) to adjust your strategy</li>
              <li>You can only test 10 times, if you can&apos;t find the correct answer after 10 times, the game is over</li>
              <li>You can share the game with your friends when the game is over</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <button 
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={hideModal}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpModal 