import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Home from './screens/Home'
import Meetings from './screens/Meetings'
import Financials from './screens/Financials'
import Approvals from './screens/Approvals'
import Documents from './screens/Documents'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/meetings"   element={<Meetings />} />
        <Route path="/financials" element={<Financials />} />
        <Route path="/approvals"  element={<Approvals />} />
        <Route path="/documents"  element={<Documents />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  )
}
