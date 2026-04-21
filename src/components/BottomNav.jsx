import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useMode } from '../ModeContext'
import './BottomNav.css'
import './CephAIChat.css'

const CONTEXT_ROUTES = ['/pulse', '/tasks', '/meeting', '/broadcast']

const CEPHAI_LOGO = '/images/cephai-logo.svg'

const LEFT_NAV  = [
  { to: '/',      label: 'Board Feed', icon: FeedIcon },
  { to: '/pulse', label: 'Pulse',      icon: PulseIcon },
]
const RIGHT_NAV = [
  { to: '/tasks', label: 'Action Items', icon: TasksIcon },
  { to: '/more',  label: 'More',  icon: MoreIcon },
]

export default function BottomNav() {
  const { isBoard, setChatOpen, cephAIPulseCount } = useMode()
  const { pathname } = useLocation()
  const hasContext = CONTEXT_ROUTES.includes(pathname)
  const [isPulsing, setIsPulsing] = useState(false)
  const [ringLong, setRingLong] = useState(false)
  const isFirst = useRef(true)
  const prevPathname = useRef(pathname)

  function triggerRing(long = false) {
    setRingLong(long)
    setIsPulsing(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsPulsing(true))
    })
  }

  // Pulse the button each time a new task card surfaces (skip mount)
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    if (cephAIPulseCount === 0) return
    triggerRing(false)
  }, [cephAIPulseCount])

  // Pulse (longer) when navigating to /pulse
  useEffect(() => {
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname
    if (pathname === '/pulse') triggerRing(true)
    if (pathname === '/meeting') triggerRing(false)
    if (pathname === '/broadcast') triggerRing(false)
  }, [pathname])

  if (!isBoard) return <ResidentNav />
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

      {/* Center CephAI button */}
      <div className="bottom-nav__center-slot">
        <button
          className={`center-btn${hasContext ? ' center-btn--glow' : ''}`}
          aria-label="CephAI"
          onClick={() => setChatOpen(true)}
        >
          <img src={CEPHAI_LOGO} alt="CephAI" className="center-btn__logo" />
        </button>

        {/* SVG ring-trace overlay */}
        {isPulsing && (
          <svg
            className="center-btn-ring"
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="#b2de61"
              strokeWidth="2.5"
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              className={`ring-circle${ringLong ? ' ring-circle--long' : ''}`}
              onAnimationEnd={() => setIsPulsing(false)}
            />
          </svg>
        )}
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


/* ── Resident Nav ────────────────────────────────────── */
const RESIDENT_ITEMS = [
  { label: 'Feed',       icon: FeedIcon },
  { label: 'Todos',      icon: ChecklistIcon },
  { label: 'Concierge',  icon: ConciergeIcon },
  { label: 'Pinboard',   icon: PinBoardIcon },
  { label: 'Chat',       icon: ResidentChatIcon },
  { label: 'More',       icon: MoreIcon },
]

function ResidentNav() {
  const [active, setActive] = useState('Feed')
  return (
    <nav className="resident-nav">
      <div className="resident-nav__bg" />
      {RESIDENT_ITEMS.map(({ label, icon: Icon }) => {
        const isActive = active === label
        return (
          <button
            key={label}
            className={`resident-nav__item${isActive ? ' resident-nav__item--active' : ''}`}
            onClick={() => setActive(label)}
          >
            <span className="resident-nav__icon"><Icon /></span>
            {isActive && <span className="resident-nav__label">{label}</span>}
          </button>
        )
      })}
    </nav>
  )
}

/* ── Nav Icons (Board) ────────────────────────────────── */
function FeedIcon() {
  return (
    <svg width="20" height="27" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.75293 0.0131558C7.51302 0.111728 8.11648 0.723646 8.20898 1.49948V28.4985C8.1527 29.3807 7.4091 30.0502 6.54492 29.9975C5.68139 30.0493 4.93895 29.3761 4.88672 28.4985V1.49948C4.99531 0.563504 5.83593 -0.101789 6.75293 0.0131558ZM14.3623 4.92722C14.5111 3.99124 15.376 3.35052 16.293 3.50241C17.0088 3.62151 17.5718 4.19654 17.6885 4.92722V25.0708C17.6161 25.9369 16.8761 26.5856 16.0234 26.52C15.1749 26.5857 14.4349 25.9416 14.3623 25.0757V4.92722ZM9.47949 9.38523C9.70872 8.44932 10.6378 7.875 11.5547 8.10886C12.17 8.26485 12.6528 8.75717 12.8057 9.38523V20.6128C12.6971 21.442 11.9571 22.0332 11.1406 21.9428C10.3242 22.0331 9.58808 21.442 9.47949 20.6128V9.38523ZM1.66504 10.4194C2.58606 10.4194 3.33008 11.1795 3.33008 12.1196V17.8911C3.33008 18.8271 2.58594 19.5903 1.66895 19.5903L1.66113 19.5864C0.744134 19.5864 0 18.8271 0 17.8911V12.1196C0 11.1836 0.744036 10.4194 1.66504 10.4194ZM20.335 11.0971C21.2558 11.0972 21.9998 11.8565 22 12.7964V17.2094C22 18.1454 21.2559 18.9096 20.3389 18.9096L20.3311 18.9048C19.4141 18.9048 18.6699 18.1454 18.6699 17.2094V12.7964C18.6701 11.8605 19.414 11.0971 20.335 11.0971Z" fill="currentColor"/>
    </svg>
  )
}

function PulseIcon() {
  return (
    <svg width="26" height="22" viewBox="0 0 77.42 65.9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M74.42,29.95h-18.73c-1.33,0-2.51.88-2.88,2.16l-5.81,19.9L33.01,2.19c-.36-1.29-1.54-2.19-2.89-2.19h0c-1.35,0-2.53.9-2.88,2.2l-7.46,27.03H3c-1.66,0-3,1.34-3,3s1.34,3,3,3h19.06c1.35,0,2.53-.9,2.89-2.2l5.2-18.84,13.9,49.52c.36,1.29,1.53,2.18,2.87,2.19h.02c1.33,0,2.51-.88,2.88-2.16l8.12-27.79h16.48c1.66,0,3-1.34,3-3s-1.34-3-3-3Z" fill="currentColor"/>
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28.8057 27.6338C29.4649 27.6339 30.0001 28.1644 30.0001 28.8174C29.9998 29.4701 29.4647 29.9999 28.8057 30H1.19733C0.538201 30 0.00323075 29.4702 0.00298994 28.8174C0.00298994 28.1643 0.538053 27.6338 1.19733 27.6338H28.8057ZM12.3858 11.8144C12.854 11.3507 13.6081 11.3507 14.0762 11.8144C14.5444 12.2782 14.5444 13.0255 14.0762 13.4892L6.05572 21.4346C5.83123 21.6569 5.53004 21.7802 5.21002 21.7803L5.20514 21.7754C4.88983 21.7754 4.58397 21.6521 4.35944 21.4297L0.351623 17.46C-0.116557 16.9962 -0.116557 16.2479 0.351623 15.7842C0.81971 15.3208 1.57395 15.3208 2.04205 15.7842L5.21002 18.9219L12.3858 11.8144ZM28.8057 16.1631C29.4647 16.1633 29.9999 16.6929 30.0001 17.3457C30.0001 17.9986 29.4648 18.5291 28.8057 18.5293H18.2042C17.545 18.5291 17.0098 17.9987 17.0098 17.3457C17.01 16.6929 17.5451 16.1632 18.2042 16.1631H28.8057ZM12.3858 0.347646C12.8539 -0.115738 13.6081 -0.1157 14.0762 0.347646C14.5444 0.811405 14.5444 1.55967 14.0762 2.02343L6.05572 9.96874C5.8312 10.1911 5.53008 10.3144 5.21002 10.3144L5.20514 10.3096C4.88985 10.3095 4.58396 10.1863 4.35944 9.96386L0.351623 5.99315C-0.116557 5.5294 -0.116557 4.78211 0.351623 4.31835C0.819803 3.85461 1.57486 3.8546 2.04303 4.31835L5.21002 7.45604L12.3858 0.347646ZM28.8057 4.69237C29.4648 4.69259 30 5.22212 30.0001 5.87499C30.0001 6.5279 29.4648 7.05836 28.8057 7.05858H18.2042C17.545 7.05844 17.0098 6.52795 17.0098 5.87499C17.0099 5.22208 17.545 4.69252 18.2042 4.69237H28.8057Z" fill="currentColor"/>
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="24" height="23" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.07776 9.65151L12.6418 15.3068C13.3793 15.6668 14.1897 15.8489 15 15.8489C15.8104 15.8489 16.6207 15.6668 17.3582 15.3068L28.9222 9.65151C29.5867 9.32384 30 8.66446 30 7.92417C30 7.18389 29.5867 6.52046 28.9222 6.19684L17.3582 0.541561C15.8833 -0.182542 14.1167 -0.178496 12.6418 0.541561L1.07776 6.19684C0.413256 6.5245 0 7.18389 0 7.92417C0 8.66446 0.413256 9.32789 1.07776 9.65151ZM13.5292 2.35383C14.4489 1.90481 15.5429 1.90481 16.4627 2.35383L27.8445 7.92417L16.4627 13.4945C15.5429 13.9435 14.4489 13.9435 13.5292 13.4945L2.14741 7.92417L13.5292 2.35383Z" fill="currentColor"/>
      <path d="M28.432 20.784L16.4709 26.6376C15.5309 27.0906 14.4571 27.0947 13.5292 26.6376L1.56403 20.78C1.06159 20.5333 0.453873 20.7436 0.206708 21.2412C-0.0404561 21.7428 0.166146 22.3496 0.668579 22.5963L12.6338 28.4539C13.3793 28.818 14.1816 29 14.9879 29C15.7943 29 16.6005 28.818 17.3542 28.4539L29.3194 22.5963C29.8218 22.3496 30.0285 21.7428 29.7813 21.2412C29.5342 20.7395 28.9304 20.5333 28.4239 20.78L28.432 20.784Z" fill="currentColor"/>
      <path d="M28.432 14.2106L16.4709 20.0641C15.5309 20.5171 14.4571 20.5212 13.5292 20.0641L1.56403 14.2065C1.06159 13.9598 0.453873 14.1661 0.206708 14.6677C-0.0404561 15.1693 0.166146 15.7761 0.668579 16.0229L12.6338 21.8804C13.3793 22.2445 14.1816 22.4265 14.9879 22.4265C15.7943 22.4265 16.6005 22.2445 17.3542 21.8804L29.3194 16.0229C29.8218 15.7761 30.0285 15.1693 29.7813 14.6677C29.5342 14.1661 28.9304 13.9598 28.4239 14.2065L28.432 14.2106Z" fill="currentColor"/>
    </svg>
  )
}

/* ── Resident-specific icons (from ICONS folder) ─────── */
function ChecklistIcon() {
  // checklist.svg — todo checklist with checkmarks
  return (
    <svg width="22" height="25" viewBox="0 0 31.3 35.03" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.99,7.44h11.06c.69,0,1.25-.56,1.25-1.25s-.56-1.25-1.25-1.25h-11.06c-.69,0-1.25.56-1.25,1.25s.56,1.25,1.25,1.25Z" fill="currentColor"/>
      <path d="M12.92.37l-7.49,7.49-3.3-3.3c-.49-.49-1.28-.49-1.76,0-.49.49-.49,1.28,0,1.76l4.18,4.18c.24.24.56.37.88.37s.64-.12.88-.37L14.68,2.13c.49-.49.49-1.28,0-1.76-.49-.49-1.28-.49-1.76,0Z" fill="currentColor"/>
      <path d="M30.05,17.03h-11.06c-.69,0-1.25.56-1.25,1.25s.56,1.25,1.25,1.25h11.06c.69,0,1.25-.56,1.25-1.25s-.56-1.25-1.25-1.25Z" fill="currentColor"/>
      <path d="M12.92,12.45l-7.49,7.49-3.3-3.3c-.49-.49-1.28-.49-1.76,0-.49.49-.49,1.28,0,1.76l4.18,4.18c.24.24.56.37.88.37s.64-.12.88-.37l8.37-8.37c.49-.49.49-1.28,0-1.76-.49-.49-1.28-.49-1.76,0Z" fill="currentColor"/>
      <path d="M30.05,29.11h-11.06c-.69,0-1.25.56-1.25,1.25s.56,1.25,1.25,1.25h11.06c.69,0,1.25-.56,1.25-1.25s-.56-1.25-1.25-1.25Z" fill="currentColor"/>
      <path d="M12.92,24.53l-7.49,7.49-3.3-3.3c-.49-.49-1.28-.49-1.76,0-.49.49-.49,1.28,0,1.76l4.18,4.18c.24.24.56.37.88.37s.64-.12.88-.37l8.37-8.37c.49-.49.49-1.28,0-1.76-.49-.49-1.28-.49-1.76,0Z" fill="currentColor"/>
    </svg>
  )
}

function ConciergeIcon() {
  // Concierge.svg — bell/concierge icon
  return (
    <svg width="22" height="20" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.001 0C17.5604 0.000100297 18.0116 0.43841 18.0117 0.982422C18.0117 1.52655 17.5605 1.96572 17.001 1.96582H16.0107V2.93652C22.4558 3.42996 27.5725 8.42153 28.0596 14.6934H28.3369C28.8964 14.6934 29.3476 15.1316 29.3477 15.6758C29.3477 16.22 28.8965 16.6582 28.3369 16.6582H20.7773V19.043H25.9863C28.2004 19.043 30 20.7891 30 22.9463V25.0176C29.9998 25.5616 29.5487 26 28.9893 26H1.01074C0.451274 26 0.000175775 25.5616 0 25.0176V22.9463C0 20.793 1.79553 19.043 4.01367 19.043H9.21875V16.6582H1.65918C1.0996 16.6582 0.648438 16.22 0.648438 15.6758C0.648512 15.1316 1.09965 14.6934 1.65918 14.6934H1.93652C2.41961 8.42148 7.5362 3.4299 13.9854 2.93652V1.96582H12.9951C12.4356 1.96579 11.9844 1.5266 11.9844 0.982422C11.9845 0.438367 12.4357 3.04815e-05 12.9951 0H17.001ZM4.00977 21.0078C2.90671 21.0117 2.0166 21.8814 2.0166 22.9541V24.042H27.9746V22.9463C27.9746 21.8775 27.0813 21.0079 25.9824 21.0078H4.00977ZM11.2402 16.6582V19.043H18.7598V16.6582H11.2402ZM14.9961 4.8623C9.25539 4.86622 4.4683 9.13005 3.95703 14.6934H26.0342C25.5269 9.13401 20.7367 4.86628 14.9961 4.8623Z" fill="currentColor"/>
    </svg>
  )
}

function PinBoardIcon() {
  // Pin Board.svg — community pinboard/bulletin board
  return (
    <svg width="22" height="20" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.6572 0C18.2073 0.00364579 18.6581 0.459334 18.6582 1.02441C18.6582 1.58591 18.2109 2.0459 17.6572 2.0459H3.60059C2.7185 2.04604 2.00414 2.77451 2.00391 3.6748V22.3252C2.00406 23.2219 2.71845 23.951 3.60059 23.9512H26.3994C27.2815 23.9509 27.9959 23.2219 27.9961 22.3252V12.0176C27.9961 11.4524 28.4424 10.9961 28.9961 10.9961H29C29.5499 10.9963 30 11.4526 30 12.0176V22.3252C29.9999 24.3558 28.3889 25.9998 26.3994 26H3.60059C1.61105 25.9999 0.000148656 24.3558 0 22.3252V3.6748C0.000231834 1.64423 1.6111 0.000138468 3.60059 0H17.6572ZM19.958 2.47559C21.5977 0.0436542 24.8595 -0.571986 27.2422 1.10156C29.6246 2.77512 30.2283 6.10335 28.5889 8.53516C26.9492 10.9671 23.6874 11.5837 21.3047 9.91016L15.8291 16.498C15.472 16.9318 14.8431 16.9834 14.418 16.6191C13.9929 16.2545 13.9426 15.6089 14.2998 15.1787L19.8975 8.44043C18.7295 6.62472 18.7506 4.26575 19.958 2.47559ZM24.2588 2.22363C22.4801 2.22387 21.0372 3.69717 21.0371 5.5127C21.0371 7.3283 22.48 8.80152 24.2588 8.80176C26.0378 8.80176 27.4814 7.32844 27.4814 5.5127C27.4814 3.69703 26.0377 2.22363 24.2588 2.22363Z" fill="currentColor"/>
    </svg>
  )
}

function ResidentChatIcon() {
  // Chat.svg — two overlapping chat bubbles
  return (
    <svg width="22" height="21" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.0801 21.7612H1.03591C0.464088 21.7612 0 21.3055 0 20.7439V10.8806C0 4.88283 4.97237 0 11.0801 0C17.1878 0 22.1602 4.88283 22.1602 10.8806C22.1602 16.8783 17.1878 21.7612 11.0801 21.7612ZM2.07182 19.7267H11.0801C16.0483 19.7267 20.0884 15.7594 20.0884 10.8806C20.0884 6.00182 16.0483 2.03452 11.0801 2.03452C6.11187 2.03452 2.07182 6.00182 2.07182 10.8806V19.7267Z" fill="currentColor"/>
      <path d="M28.9599 29H18.9116C16.1395 29 13.4792 27.9868 11.4323 26.1435C11.0096 25.7651 10.9807 25.1222 11.366 24.7071C11.7514 24.2921 12.4061 24.2636 12.8287 24.642C14.4945 26.1394 16.6574 26.9655 18.9116 26.9655H27.924V18.1235C27.924 15.7105 26.9502 13.4563 25.1809 11.7717C24.7707 11.3811 24.7582 10.7382 25.1602 10.3313C25.558 9.92842 26.2127 9.92028 26.627 10.3109C28.8025 12.382 30 15.1571 30 18.1235V27.9827C30 28.5442 29.5359 29 28.9641 29H28.9599Z" fill="currentColor"/>
    </svg>
  )
}
