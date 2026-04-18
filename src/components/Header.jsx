import { useLocation } from 'react-router-dom'
import { useMode } from '../ModeContext'
import './Header.css'

const CINC_ICON = 'https://www.figma.com/api/mcp/asset/866d98ff-311b-47f8-88af-f2fb6077ab28'

export default function Header() {
  const { isBoard, setIsBoard } = useMode()
  const { pathname } = useLocation()

  const screenTitle = {
    '/':       null,
    '/pulse':  'Community Pulse',
    '/tasks':  'Board Tasks',
    '/more':   'More',
  }[pathname] ?? null

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__left">
          <div className="app-header__logo">
            <img src={CINC_ICON} alt="CINC" />
          </div>
          <div className="app-header__hoa">
            <span className="app-header__hoa-name">Cardinal Hills HOA</span>
            {screenTitle && <span className="app-header__screen">{screenTitle}</span>}
          </div>
        </div>

        <div className="app-header__right">
          <button
            className={`board-toggle ${isBoard ? 'board-toggle--board' : 'board-toggle--resident'}`}
            onClick={() => setIsBoard(b => !b)}
            aria-label="Switch mode"
          >
            <div className="board-toggle__track">
              <div className="board-toggle__thumb">
                {isBoard ? <BoardIcon /> : <ResidentIcon />}
              </div>
              <span className="board-toggle__label">{isBoard ? 'Board' : 'Resident'}</span>
            </div>
          </button>

          <button className="notif-btn" aria-label="Notifications">
            <BellIcon />
            <span className="notif-btn__badge">5</span>
          </button>
        </div>
      </div>
      <div className="app-header__divider" />
    </header>
  )
}

function BoardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ResidentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
