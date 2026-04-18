import { NavLink, useLocation } from 'react-router-dom'
import './BottomNav.css'

const LEFT_NAV  = [
  { to: '/',      label: 'Board Feed', icon: FeedIcon },
  { to: '/pulse', label: 'Pulse',      icon: PulseIcon },
]
const RIGHT_NAV = [
  { to: '/tasks', label: 'Tasks', icon: TasksIcon },
  { to: '/more',  label: 'More',  icon: MoreIcon },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const isCenter = false // center button never "active" by route

  return (
    <nav className="bottom-nav">
      {/* Arch background shape */}
      <div className="bottom-nav__bg" />

      {/* Left items */}
      <div className="bottom-nav__side">
        {LEFT_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item${isActive ? ' nav-item--active' : ''}`
            }
          >
            <span className="nav-item__icon"><Icon /></span>
            <span className="nav-item__label">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Center CINC button */}
      <div className="bottom-nav__center-slot">
        <button className="center-btn" aria-label="CINC">
          <CincLogo />
        </button>
      </div>

      {/* Right items */}
      <div className="bottom-nav__side">
        {RIGHT_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item${isActive ? ' nav-item--active' : ''}`
            }
          >
            <span className="nav-item__icon"><Icon /></span>
            <span className="nav-item__label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

/* ── CINC Logo ────────────────────────────────────── */
function CincLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 4 L34 14 L34 28 L20 36 L6 28 L6 14 Z" fill="none" stroke="#b2de61" strokeWidth="1.5"/>
      <path d="M20 8 L20 32 M12 12 L28 12 M12 28 L28 28" stroke="#b2de61" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="4" fill="#b2de61"/>
      <path d="M20 16 L24 20 L20 24 L16 20 Z" fill="#1a1a1a"/>
    </svg>
  )
}

/* ── Nav Icons ────────────────────────────────────── */
function FeedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 12h3M3 6h3M3 18h3"/>
      <path d="M9 12h3M9 6h3M9 18h3"/>
      <path d="M15 8v8M18 5v14M21 9v6"/>
    </svg>
  )
}

function PulseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="4" height="18" rx="1"/>
      <rect x="10" y="8" width="4" height="13" rx="1"/>
      <rect x="18" y="13" width="4" height="8" rx="1"/>
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  )
}
