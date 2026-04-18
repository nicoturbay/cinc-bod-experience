import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ModeProvider } from './ModeContext'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Feed from './screens/Feed'
import Pulse from './screens/Pulse'
import Tasks from './screens/Tasks'
import More from './screens/More'

export default function App() {
  return (
    <ModeProvider>
      <BrowserRouter>
        <div className="phone-frame">
          <Header />
          <Routes>
            <Route path="/"       element={<Feed />} />
            <Route path="/pulse"  element={<Pulse />} />
            <Route path="/tasks"  element={<Tasks />} />
            <Route path="/more"   element={<More />} />
            <Route path="*"       element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </ModeProvider>
  )
}
