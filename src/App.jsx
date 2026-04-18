import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ModeProvider, useMode } from './ModeContext'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import WelcomeModal from './components/WelcomeModal'
import Feed from './screens/Feed'
import Pulse from './screens/Pulse'
import Tasks from './screens/Tasks'
import More from './screens/More'

function AppShell() {
  const { isBoard } = useMode()
  const [showWelcome, setShowWelcome] = useState(false)
  const prevIsBoard = useRef(false)

  useEffect(() => {
    // Fired when toggling FROM resident TO board
    if (isBoard && !prevIsBoard.current) {
      const dismissed = localStorage.getItem('boardWelcomeDismissed') === 'true'
      if (!dismissed) setShowWelcome(true)
    }
    prevIsBoard.current = isBoard
  }, [isBoard])

  return (
    <div className={`phone-frame${isBoard ? '' : ' resident-mode'}`}>
      <Header />
      <Routes>
        <Route path="/"       element={<Feed />} />
        <Route path="/pulse"  element={<Pulse />} />
        <Route path="/tasks"  element={<Tasks />} />
        <Route path="/more"   element={<More />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <ModeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ModeProvider>
  )
}
