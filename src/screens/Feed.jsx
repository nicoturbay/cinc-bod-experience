import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMode } from '../ModeContext'
import './Feed.css'
import CalendarCheckSvg from '../ICONS/calendar-check.svg'
import WorkSvg from '../Illustrations/Work.svg'
import EmailsSvg from '../Illustrations/emails.svg'
import WOSvg from '../Illustrations/WO.svg'
import InvoicesSvg from '../Illustrations/invoices.svg'
import ViolationsSvg from '../Illustrations/violations.svg'

const CINC_ICON     = '/images/cinc-icon.png'
const CEPHAI_LOGO   = '/images/cephai-logo.svg'
const RV_PHOTO      = '/images/rv-photo.jpg'
const AVATAR_1      = '/images/avatar-1.jpg'
const AVATAR_2      = '/images/avatar-2.jpg'
const AVATAR_3      = '/images/avatar-3.jpg'
const AVATAR_4      = '/images/avatar-4.jpg'
const LINKEDIN_AVT  = '/images/avatar-linkedin.jpg'

/* ── Weekly Wrap Slide Data ───────────────────────── */
const WEEKLY_SLIDES = [
  {
    eyebrow: 'Resident Communication & Responsiveness',
    headline: 'Always On.\nAlways Responsive.',
    copy: 'We stayed connected and accessible, ensuring residents received timely responses and consistent support across all communications.',
    kpis: [
      { label: 'Resident Touchpoints', value: '153' },
      { label: 'Calls Answered', value: '55' },
      { label: 'Emails Responded', value: '98' },
      { label: 'Avg. Response Time', value: '2.3 Hrs' },
    ],
    theme: {
      overlayBg: '#21181A',
      kpiBg: '#B2DE61',
      kpiValueColor: '#112719',
      kpiLabelColor: '#112719',
    },
  },
  {
    eyebrow: 'Work Orders & Maintenance Execution',
    headline: 'Maintenance,\nHandled. Start\nto Finish.',
    copy: 'From intake to completion, work orders were efficiently managed and executed to keep the community running smoothly and well maintained.',
    kpis: [
      { label: 'Work Orders Received', value: '13' },
      { label: 'Assigned to Vendors', value: '13' },
      { label: 'Completed This Week', value: '7' },
      { label: 'Avg Completion Time', value: '2.1 Days' },
    ],
    theme: {
      overlayBg: '#AEDBBE',
      kpiBg: '#21181A',
      kpiValueColor: '#FFF8EA',
      kpiLabelColor: '#FFF8EA',
      eyebrowColor: '#1d1d1d',
      headlineColor: '#21181A',
      copyColor: '#21181A',
      illustrationSize: '104%',
      lightBg: true,
    },
  },
  {
    eyebrow: 'Financial Oversight & Collections',
    headline: 'Finances Managed\nwith Clarity\nand Control',
    copy: 'We maintained strong financial oversight by processing payments, driving collections, and proactively addressing delinquencies.',
    kpis: [
      { label: 'Collected', value: '$185K' },
      { label: 'Delinquent Accounts Contacted', value: '23' },
      { label: 'Invoices Processed', value: '12' },
      { label: 'Verified & Approved', value: '100%' },
    ],
    theme: {
      overlayBg: '#112719',
      kpiBg: '#AEDBBE',
      kpiValueColor: '#112719',
      kpiLabelColor: '#112719',
    },
  },
  {
    eyebrow: 'Violations & Compliance',
    headline: 'Standards Upheld.\nCommunity\nProtected.',
    copy: 'We consistently enforced community rules, addressed violations, and followed up on repeat issues to maintain the integrity of the community.',
    kpis: [
      { label: 'Violations Issued', value: '18' },
      { label: 'Resolved', value: '11' },
      { label: 'Repeat Cases Escalated', value: '3' },
      { label: 'Resolution Rate', value: '61%' },
    ],
    theme: {
      overlayBg: '#B2DE61',
      kpiBg: '#21181A',
      kpiValueColor: '#FFF8EA',
      kpiLabelColor: '#FFF8EA',
      eyebrowColor: '#1d1d1d',
      headlineColor: '#21181A',
      copyColor: '#21181A',
      lightBg: true,
    },
  },
  {
    eyebrow: 'Architectural Requests (ARC)',
    headline: 'Thoughtful\nReviews. Consistent\nStandards.',
    copy: 'Architectural requests were reviewed efficiently and fairly, ensuring alignment with community guidelines while maintaining timely approvals.',
    kpis: [
      { label: 'ARC Requests Received', value: '5' },
      { label: 'Approved', value: '4' },
      { label: 'Pending Review', value: '1' },
      { label: 'Avg Review Time', value: '3.2 Days' },
    ],
  },
]

const SLIDE_ILLUSTRATIONS = [
  EmailsSvg,
  WOSvg,
  InvoicesSvg,
  ViolationsSvg,
  WorkSvg,
]

/* ── Slide Illustrations ──────────────────────────── */
function IllustrationComm() {
  return (
    <svg viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="stories-illus-svg">
      <rect x="18" y="18" width="130" height="90" rx="18" fill="#235237" stroke="#b2de61" strokeWidth="2.5"/>
      <path d="M44 108 L34 128 L72 108" fill="#235237" stroke="#b2de61" strokeWidth="2.5" strokeLinejoin="round"/>
      <rect x="34" y="38" width="80" height="10" rx="5" fill="#b2de61" opacity="0.75"/>
      <rect x="34" y="56" width="98" height="10" rx="5" fill="#b2de61" opacity="0.5"/>
      <rect x="34" y="74" width="60" height="10" rx="5" fill="#b2de61" opacity="0.3"/>
      <rect x="112" y="62" width="98" height="76" rx="16" fill="#1a3828" stroke="#b2de61" strokeWidth="2"/>
      <path d="M128 138 L122 155 L152 138" fill="#1a3828" stroke="#b2de61" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="126" y="80" width="66" height="9" rx="4.5" fill="#b2de61" opacity="0.6"/>
      <rect x="126" y="96" width="52" height="9" rx="4.5" fill="#b2de61" opacity="0.4"/>
      <rect x="126" y="112" width="40" height="9" rx="4.5" fill="#b2de61" opacity="0.25"/>
      <circle cx="196" cy="22" r="14" fill="#b2de61"/>
      <text x="196" y="28" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1a3828" fontFamily="Montserrat,sans-serif">@</text>
      <path d="M4 90 L28 80 L22 104 Z" fill="#b2de61" opacity="0.8"/>
      <line x1="14" y1="92" x2="22" y2="104" stroke="#1a3828" strokeWidth="2"/>
      <circle cx="200" cy="148" r="9" fill="#b2de61" opacity="0.45"/>
    </svg>
  )
}

function IllustrationMaintenance() {
  return (
    <svg viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="stories-illus-svg">
      <path d="M110 18 L190 78 L174 78 L174 158 L46 158 L46 78 L30 78 Z" fill="#235237" stroke="#b2de61" strokeWidth="2.5" strokeLinejoin="round"/>
      <rect x="82" y="116" width="56" height="42" rx="4" fill="#1a3828" stroke="#b2de61" strokeWidth="2"/>
      <circle cx="132" cy="137" r="3.5" fill="#b2de61"/>
      <rect x="56" y="95" width="36" height="28" rx="4" fill="#1a3828" stroke="#b2de61" strokeWidth="2"/>
      <line x1="74" y1="95" x2="74" y2="123" stroke="#b2de61" strokeWidth="1.5" opacity="0.5"/>
      <line x1="56" y1="109" x2="92" y2="109" stroke="#b2de61" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="172" cy="48" r="30" fill="#b2de61"/>
      <polyline points="158,48 168,58 186,40" stroke="#235237" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 155 Q6 146 10 134 L38 106 L48 116 L22 144 Q28 156 14 155Z" fill="#b2de61" opacity="0.75"/>
      <rect x="40" y="100" width="22" height="9" rx="3" fill="#b2de61" opacity="0.75" transform="rotate(-45 51 104)"/>
    </svg>
  )
}

function IllustrationFinance() {
  return (
    <svg viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="stories-illus-svg">
      <line x1="28" y1="138" x2="200" y2="138" stroke="#b2de61" strokeWidth="2" opacity="0.35"/>
      <line x1="28" y1="108" x2="200" y2="108" stroke="#b2de61" strokeWidth="1" opacity="0.2"/>
      <line x1="28" y1="78" x2="200" y2="78" stroke="#b2de61" strokeWidth="1" opacity="0.2"/>
      <line x1="28" y1="48" x2="200" y2="48" stroke="#b2de61" strokeWidth="1" opacity="0.2"/>
      <line x1="28" y1="18" x2="200" y2="18" stroke="#b2de61" strokeWidth="1" opacity="0.2"/>
      <line x1="28" y1="18" x2="28" y2="142" stroke="#b2de61" strokeWidth="2" opacity="0.35"/>
      <rect x="42" y="100" width="34" height="38" rx="5" fill="#235237" stroke="#b2de61" strokeWidth="2"/>
      <rect x="93" y="70" width="34" height="68" rx="5" fill="#235237" stroke="#b2de61" strokeWidth="2"/>
      <rect x="144" y="36" width="34" height="102" rx="5" fill="#b2de61"/>
      <polyline points="59,102 110,72 161,38" stroke="#b2de61" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 4"/>
      <circle cx="59" cy="102" r="5" fill="#b2de61"/>
      <circle cx="110" cy="72" r="5" fill="#b2de61"/>
      <circle cx="161" cy="38" r="5" fill="#235237" stroke="#b2de61" strokeWidth="2.5"/>
      <circle cx="196" cy="148" r="18" fill="#235237" stroke="#b2de61" strokeWidth="2"/>
      <text x="196" y="155" textAnchor="middle" fontSize="18" fontWeight="800" fill="#b2de61" fontFamily="Montserrat,sans-serif">$</text>
    </svg>
  )
}

function IllustrationViolations() {
  return (
    <svg viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="stories-illus-svg">
      <path d="M110 10 L182 38 L182 98 Q182 148 110 165 Q38 148 38 98 L38 38 Z" fill="#235237" stroke="#b2de61" strokeWidth="2.5"/>
      <path d="M110 28 L165 50 L165 96 Q165 134 110 148 Q55 134 55 96 L55 50 Z" fill="#1a3828"/>
      <polyline points="76,88 98,110 144,66" stroke="#b2de61" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="22" cy="32" r="7" fill="#b2de61" opacity="0.5"/>
      <circle cx="198" cy="130" r="9" fill="#b2de61" opacity="0.4"/>
      <circle cx="195" cy="24" r="5" fill="#b2de61" opacity="0.35"/>
      <circle cx="14" cy="138" r="4" fill="#b2de61" opacity="0.3"/>
    </svg>
  )
}

function IllustrationARC() {
  return (
    <svg viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="stories-illus-svg">
      <rect x="14" y="10" width="162" height="150" rx="7" fill="#1a3828" stroke="#b2de61" strokeWidth="2"/>
      <line x1="14" y1="40" x2="176" y2="40" stroke="#b2de61" strokeWidth="0.6" opacity="0.25"/>
      <line x1="14" y1="70" x2="176" y2="70" stroke="#b2de61" strokeWidth="0.6" opacity="0.25"/>
      <line x1="14" y1="100" x2="176" y2="100" stroke="#b2de61" strokeWidth="0.6" opacity="0.25"/>
      <line x1="14" y1="130" x2="176" y2="130" stroke="#b2de61" strokeWidth="0.6" opacity="0.25"/>
      <line x1="54" y1="10" x2="54" y2="160" stroke="#b2de61" strokeWidth="0.6" opacity="0.25"/>
      <line x1="94" y1="10" x2="94" y2="160" stroke="#b2de61" strokeWidth="0.6" opacity="0.25"/>
      <line x1="134" y1="10" x2="134" y2="160" stroke="#b2de61" strokeWidth="0.6" opacity="0.25"/>
      <rect x="28" y="30" width="120" height="110" rx="2" fill="none" stroke="#b2de61" strokeWidth="2.5"/>
      <line x1="88" y1="30" x2="88" y2="140" stroke="#b2de61" strokeWidth="2"/>
      <line x1="28" y1="85" x2="88" y2="85" stroke="#b2de61" strokeWidth="2"/>
      <line x1="52" y1="85" x2="64" y2="85" stroke="#1a3828" strokeWidth="5"/>
      <path d="M52 85 Q52 97 64 97" stroke="#b2de61" strokeWidth="1.5" fill="none" opacity="0.8"/>
      <rect x="100" y="46" width="32" height="22" rx="2" fill="none" stroke="#b2de61" strokeWidth="1.5"/>
      <line x1="116" y1="46" x2="116" y2="68" stroke="#b2de61" strokeWidth="1" opacity="0.6"/>
      <rect x="182" y="12" width="22" height="148" rx="6" fill="#b2de61" transform="rotate(12 193 86)"/>
      <rect x="185" y="14" width="16" height="143" rx="4" fill="#235237" transform="rotate(12 193 86)"/>
      <path d="M182 12 L179 4 L196 9 Z" fill="#b2de61" transform="rotate(12 193 86)"/>
      <line x1="188" y1="24" x2="196" y2="24" stroke="#b2de61" strokeWidth="1" opacity="0.6" transform="rotate(12 193 86)"/>
      <line x1="190" y1="38" x2="196" y2="38" stroke="#b2de61" strokeWidth="1" opacity="0.6" transform="rotate(12 193 86)"/>
      <line x1="188" y1="52" x2="196" y2="52" stroke="#b2de61" strokeWidth="1" opacity="0.6" transform="rotate(12 193 86)"/>
      <line x1="190" y1="66" x2="196" y2="66" stroke="#b2de61" strokeWidth="1" opacity="0.6" transform="rotate(12 193 86)"/>
      <line x1="188" y1="80" x2="196" y2="80" stroke="#b2de61" strokeWidth="1" opacity="0.6" transform="rotate(12 193 86)"/>
    </svg>
  )
}

/* ── Weekly Wrap Stories Overlay ──────────────────── */
function WeeklyWrapStories({ onClose }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const remainingRef = useRef(8000)
  const isHoldRef = useRef(false)
  const holdTimerRef = useRef(null)

  // Reset remaining time whenever slide changes
  useEffect(() => { remainingRef.current = 8000 }, [current])

  // Auto-advance timer — pauses when held
  useEffect(() => {
    if (paused) {
      clearTimeout(timerRef.current)
      if (startTimeRef.current !== null) {
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current))
        startTimeRef.current = null
      }
      return
    }
    startTimeRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      if (current >= WEEKLY_SLIDES.length - 1) onCloseRef.current()
      else setCurrent(c => c + 1)
    }, remainingRef.current)
    return () => clearTimeout(timerRef.current)
  }, [paused, current])

  function handlePointerDown() {
    isHoldRef.current = false
    holdTimerRef.current = setTimeout(() => {
      isHoldRef.current = true
      setPaused(true)
    }, 200)
  }

  function handlePointerUp(e) {
    clearTimeout(holdTimerRef.current)
    if (isHoldRef.current) {
      isHoldRef.current = false
      setPaused(false)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    if (e.clientX - rect.left < rect.width / 2) {
      setCurrent(c => Math.max(0, c - 1))
    } else {
      if (current >= WEEKLY_SLIDES.length - 1) { onClose(); return }
      setCurrent(c => c + 1)
    }
  }

  function handlePointerLeave() {
    clearTimeout(holdTimerRef.current)
    if (isHoldRef.current) {
      isHoldRef.current = false
      setPaused(false)
    }
  }

  const slide = WEEKLY_SLIDES[current]
  const t = slide.theme || {}

  return (
    <div
      className={`stories-overlay${paused ? ' stories-overlay--paused' : ''}`}
      style={{ background: t.overlayBg || '#111' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <div className={`stories-progress${t.lightBg ? ' stories-progress--light' : ''}`} key={current}>
        {WEEKLY_SLIDES.map((_, i) => (
          <div
            key={i}
            className={`stories-bar${i < current ? ' stories-bar--done' : i === current ? ' stories-bar--active' : ''}`}
          />
        ))}
      </div>

      <div className="stories-company-row">
        <img src={CINC_ICON} alt="" className="stories-logo" />
        <div className="stories-company-info">
          <span className="stories-company-name">East Management Company</span>
          <span className="stories-company-date">Weekly Wrap Apr 12th – 18th</span>
        </div>
        <button
          className="stories-close-btn"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onClose() }}
        >
          <StoriesCloseIcon />
        </button>
      </div>

      <div className="stories-content">
        <p className="stories-eyebrow" style={t.eyebrowColor ? { color: t.eyebrowColor } : undefined}>{slide.eyebrow}</p>
        <h1 className="stories-headline" style={t.headlineColor ? { color: t.headlineColor } : undefined}>{slide.headline}</h1>
        <p className="stories-copy" style={t.copyColor ? { color: t.copyColor } : undefined}>{slide.copy}</p>
      </div>

      <div className="stories-illus">
        <img
          src={SLIDE_ILLUSTRATIONS[current]}
          alt=""
          className="stories-illus-svg"
          style={t.illustrationSize ? { width: t.illustrationSize, height: t.illustrationSize } : undefined}
        />
      </div>

      <div className="stories-kpis">
        {slide.kpis.map((kpi, i) => (
          <div key={i} className="stories-kpi" style={{ background: t.kpiBg || '#aedbbe' }}>
            <span className="stories-kpi__label" style={t.kpiLabelColor ? { color: t.kpiLabelColor } : undefined}>{kpi.label}</span>
            <span className="stories-kpi__value" style={t.kpiValueColor ? { color: t.kpiValueColor } : undefined}>{kpi.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const BOARD_POSTS = [
  {
    id: 1,
    name: 'Darren Wilson',
    initials: 'DW',
    time: '5 minutes ago',
    isBoardMember: true,
    title: 'Important Decisions Ahead for Our Next Board Meeting',
    body: 'As we prepare for our upcoming board meeting, there are several important decisions on the table that will shape the direction of our community. From budget considerations to upcoming projects and policy updates, your input and awareness are key. We encourage everyone to review the agenda and stay informed as we work together to make the best choices for our association.',
    image: null,
    likes: 5,
    comments: 11,
    avatarImg: AVATAR_1,
  },
  {
    id: 2,
    name: 'Lisa Thomas',
    initials: 'LT',
    time: '1 Day Ago',
    isBoardMember: true,
    title: 'RV Parked on Sidewalk Under Review',
    body: 'An RV parked on the sidewalk has been identified and is currently under review. Updates will follow as needed.',
    image: RV_PHOTO,
    likes: 5,
    comments: 11,
    avatarImg: AVATAR_2,
  },
  {
    id: 3,
    name: 'Thomas Lowes',
    initials: 'TL',
    time: '3 Days Ago',
    isBoardMember: true,
    title: 'Request to Postpone April 17 Board Meeting',
    body: 'Would it be possible to move the April 17 board meeting to the following day? Please share your availability.',
    image: null,
    likes: 5,
    comments: 11,
    avatarImg: LINKEDIN_AVT,
  },
]

export default function Feed() {
  const { isBoard } = useMode()
  return isBoard ? <BoardFeed /> : <ResidentFeed />
}

/* ── Board Experience Feed ──────────────────────────── */
function BoardFeed() {
  const [digestDismissed, setDigestDismissed] = useState(false)
  const [storiesOpen, setStoriesOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="screen">
      {storiesOpen && <WeeklyWrapStories onClose={() => setStoriesOpen(false)} />}
      <div className="screen-inner">

        <div className="engage-bar">
          <span className="engage-bar__text">Engage with Fellow Board Members</span>
          <div className="engage-bar__icons">
            <button className="engage-bar__icon-btn"><EditIcon /></button>
            <button className="engage-bar__icon-btn engage-bar__icon-btn--filled"><SlidersIcon /></button>
          </div>
        </div>

        <div className="alert-banner" onClick={() => navigate('/meeting')}>
          <img src={CalendarCheckSvg} alt="" className="alert-banner__icon" />
          <div className="alert-banner__body">
            <p className="alert-banner__title">BOD Meeting. Tonight 5:30PM</p>
            <p className="alert-banner__text">Zoom Meeting, 9 hearing decisions pending board vote, See Agenda</p>
          </div>
          <ChevronRightIcon />
        </div>

        <WeeklyWrapCard onOpen={() => setStoriesOpen(true)} />

        {!digestDismissed && (
          <div className="digest-card">
            <div className="digest-card__header">
              <div className="digest-card__author">
                <img src={CEPHAI_LOGO} alt="CephAI" className="digest-card__logo" />
                <div>
                  <p className="digest-card__name">CephAi</p>
                  <p className="digest-card__time">Now</p>
                </div>
              </div>
              <button className="digest-card__close" onClick={() => setDigestDismissed(true)} aria-label="Dismiss">✕</button>
            </div>
            <p className="digest-card__title">Hello John, Your Daily Digest is ready</p>
            <div className="digest-card__body">
              <p>I have put together the most pressing things you need to review, approve or take action on.</p>
              <ul className="digest-card__list">
                <li>3 new invoices for Approval</li>
                <li>2 new ACC requests for review</li>
                <li>1 New Violation pending escalation decision</li>
                <li>1 New Work Order for review and comment</li>
                <li>2 board Tasks you need to complete</li>
              </ul>
            </div>
            <button className="cta-btn" onClick={() => navigate('/tasks')}>LET'S DO THIS</button>
          </div>
        )}

        {BOARD_POSTS.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  )
}

/* ── Resident Experience Feed ───────────────────────── */
const RESIDENT_POSTS = [
  {
    id: 'r1',
    name: 'Dalton Thomson',
    initials: 'DT',
    time: '5 minutes ago',
    isBoardMember: true,
    title: 'Board Of Directors Election',
    body: 'The deadline to cast your vote is February 12. Just click in the button below and cast your vote.',
    image: RV_PHOTO,
    likes: 8,
    comments: 14,
    avatarImg: AVATAR_1,
  },
  {
    id: 'r2',
    name: 'Lisa Thomas',
    initials: 'LT',
    time: '1 Day Ago',
    isBoardMember: true,
    title: 'Community Pool Opening Soon',
    body: 'The pool will reopen May 1st with new hours: 8 AM – 9 PM daily. Please review the updated pool rules before your first visit.',
    image: null,
    likes: 5,
    comments: 11,
    avatarImg: AVATAR_2,
  },
]

function ResidentFeed() {
  return (
    <div className="screen">
      <div className="screen-inner">

        {/* Engage bar */}
        <div className="engage-bar">
          <span className="engage-bar__text">Engage With Your Neighbors</span>
          <div className="engage-bar__icons">
            <button className="engage-bar__icon-btn"><EditIcon /></button>
            <button className="engage-bar__icon-btn engage-bar__icon-btn--filled"><SlidersIcon /></button>
          </div>
        </div>

        {/* Account balance card */}
        <div className="acct-card">
          <div className="acct-card__top">
            <div className="acct-card__acct-row">
              <span className="acct-card__acct-label"><strong>Acct:</strong> 1588:6523</span>
              <ChevronRightSmallIcon />
            </div>
            <p className="acct-card__address">12346 Washington Avenue</p>
            <div className="acct-card__balance-row">
              <span className="acct-card__balance-label">Current Balance</span>
              <span className="acct-card__balance-dots" />
              <span className="acct-card__balance-amount">$750.41</span>
            </div>
          </div>
          <div className="acct-card__divider" />
          <div className="acct-card__autopay-row">
            <AutopayIcon />
            <span className="acct-card__autopay-text">Autopay scheduled for 03/01/2026</span>
            <ChevronRightSmallIcon />
          </div>
          <button className="acct-card__cta">MAKE A PAYMENT</button>
          <p className="acct-card__private">Only you can see this</p>
          <div className="acct-card__dots">
            <span className="acct-card__dot acct-card__dot--active" />
            <span className="acct-card__dot" />
            <span className="acct-card__dot" />
          </div>
        </div>

        {/* Community posts */}
        {RESIDENT_POSTS.map(post => <PostCard key={post.id} post={post} />)}

      </div>
    </div>
  )
}

function PostCard({ post }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="post-card card">
      {/* Post header */}
      <div className="post-card__header">
        <div className="post-avatar-wrap">
          <img src={post.avatarImg} alt={post.name} className="post-avatar" />
          {post.isBoardMember && (
            <div className="post-bm-badge" title="Board Member">BM</div>
          )}
        </div>
        <div className="post-card__meta">
          <span className="post-card__name">{post.name}</span>
          <span className="post-card__time">{post.time}</span>
        </div>
        <button className="post-card__menu" aria-label="More options">
          <DotsIcon />
        </button>
      </div>

      {/* Title */}
      <div className="post-card__content">
        <p className="post-card__title">{post.title}</p>
        <p className="post-card__body">{post.body}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="post-card__image">
          <img src={post.image} alt="Post" />
        </div>
      )}

      {/* Social row */}
      <div className="post-social">
        <div className="post-social__left">
          <div className="post-social__avatars">
            <img src={AVATAR_1} alt="" className="post-social__av" />
            <img src={AVATAR_2} alt="" className="post-social__av" />
            <img src={AVATAR_3} alt="" className="post-social__av" />
            <img src={AVATAR_4} alt="" className="post-social__av" />
          </div>
          <span className="post-social__liked-by">
            Liked by <strong>Liza Stevens</strong> and {post.likes - 1} others
          </span>
        </div>
        <div className="post-social__actions">
          <button
            className={`post-social__btn${liked ? ' post-social__btn--liked' : ''}`}
            onClick={() => setLiked(l => !l)}
          >
            <HeartIcon filled={liked} />
            <span>{liked ? post.likes + 1 : post.likes}</span>
          </button>
          <button className="post-social__btn">
            <CommentIcon />
            <span>{post.comments}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Weekly Wrap Card ───────────────────────────────── */
function WeeklyWrapCard({ onOpen }) {
  return (
    <div className="weekly-wrap">
      <div className="weekly-wrap__content">
        <div className="weekly-wrap__left">
          <p className="weekly-wrap__eyebrow">Your Weekly Wrap</p>
          <span className="weekly-wrap__date-pill">APR 12th – 18th</span>
          <p className="weekly-wrap__title">Here's What East Management Has Been Up To</p>
          <p className="weekly-wrap__sub">A quick look at the meaningful work happening behind the scenes.</p>
        </div>
        <img src={WorkSvg} alt="" className="weekly-wrap__illustration" />
      </div>
      <div className="weekly-wrap__btn-wrap">
        <button className="weekly-wrap__cta" onClick={onOpen}>See What We Delivered</button>
      </div>
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────── */
function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  )
}
function SortIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M7 12h10M10 18h4"/>
    </svg>
  )
}
function BellAlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#112719" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#112719" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}
function ChevronRightSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}
function SlidersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
      <line x1="4" y1="12" x2="20" y2="12"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <line x1="4" y1="18" x2="20" y2="18"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>
  )
}
function AutopayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  )
}
function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="19" cy="12" r="1.5"/>
    </svg>
  )
}
function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#df434f' : 'none'} stroke={filled ? '#df434f' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}
function StoriesCloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
