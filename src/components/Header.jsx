import { useLocation } from 'react-router-dom'
import './Header.css'

const TITLES = {
  '/':           { label: 'Good morning,', sub: 'Maria' },
  '/meetings':   { label: 'Meetings', sub: 'Sunset Ridge HOA' },
  '/financials': { label: 'Financials', sub: 'Sunset Ridge HOA' },
  '/approvals':  { label: 'Approvals', sub: 'Pending your review' },
  '/documents':  { label: 'Documents', sub: 'Governing & Records' },
}

export default function Header() {
  const { pathname } = useLocation()
  const { label, sub } = TITLES[pathname] ?? TITLES['/']
  const isHome = pathname === '/'

  return (
    <header className="app-header">
      <div className="app-header__left">
        <div className="app-header__logo">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#9ac93c"/>
            <path d="M10 22 L16 10 L22 22" stroke="#193927" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M12.5 18h7" stroke="#193927" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="app-header__title">
          <span className={isHome ? 'app-header__greeting' : 'app-header__page'}>{label}</span>
          {isHome
            ? <span className="app-header__name">{sub}</span>
            : <span className="app-header__sub">{sub}</span>
          }
        </div>
      </div>
      <div className="app-header__right">
        <button className="app-header__icon-btn" aria-label="Notifications">
          <NotifIcon />
          <span className="app-header__dot" />
        </button>
        <button className="app-header__avatar" aria-label="Profile">MT</button>
      </div>
    </header>
  )
}

function NotifIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
