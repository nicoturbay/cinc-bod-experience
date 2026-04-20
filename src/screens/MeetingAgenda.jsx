import './MeetingAgenda.css'

const GENERAL_ITEMS = [
  {
    id: 'I',
    title: 'Call to order — 5:30 PM',
    sub: null,
    badge: null,
  },
  {
    id: 'II',
    title: 'Homeowner forum',
    sub: '30 min max',
    badge: null,
  },
  {
    id: 'III',
    title: 'Consent calendar',
    sub: 'Minutes · Financials · Delinquency · Investment',
    badge: { label: 'Vote', type: 'vote' },
  },
  {
    id: 'IV',
    title: 'New business',
    sub: 'Holiday lighting · Perimeter restroom',
    badge: { label: 'Vote', type: 'vote' },
  },
]

const EXEC_ITEMS = [
  {
    id: 'A',
    title: 'Exec session minutes',
    sub: null,
    badge: { label: 'Vote', type: 'vote' },
  },
  {
    id: 'B',
    title: 'Violation hearings — 9 cases',
    sub: 'Tang, Chen, Ahluwalia + 6 more',
    badge: { label: 'Fines', type: 'fines' },
  },
  {
    id: 'C',
    title: 'Delinquency decisions',
    sub: '4 accounts — lien & foreclosure',
    badge: { label: 'Auth', type: 'auth' },
  },
  {
    id: 'D',
    title: 'Executive correspondence',
    sub: null,
    badge: { label: 'Info', type: 'info' },
  },
]

export default function MeetingAgenda() {
  return (
    <div className="screen meeting-screen">
      <div className="meeting-inner">

        {/* Title */}
        <div className="meeting-header">
          <h1 className="meeting-title">BOD Meeting</h1>
          <p className="meeting-sub">April 19 · Zoom · 5:30 PM General · 6:30 PM Executive</p>
        </div>

        {/* General session */}
        <div className="agenda-section">
          {GENERAL_ITEMS.map((item, i) => (
            <AgendaRow
              key={item.id}
              item={item}
              isLast={i === GENERAL_ITEMS.length - 1}
            />
          ))}
        </div>

        {/* Executive session */}
        <p className="agenda-section-label">Executive Session</p>
        <div className="agenda-section">
          {EXEC_ITEMS.map((item, i) => (
            <AgendaRow
              key={item.id}
              item={item}
              isLast={i === EXEC_ITEMS.length - 1}
            />
          ))}
        </div>

        {/* Bottom actions — inside scroll */}
        <div className="meeting-actions">
          <button className="meeting-btn meeting-btn--zoom">
            <ZoomIcon />
            Join Zoom
          </button>
          <button className="meeting-btn meeting-btn--pdf">
            <PdfIcon />
            Download Board Packet
          </button>
        </div>

      </div>
    </div>
  )
}

function AgendaRow({ item, isLast }) {
  return (
    <div className={`agenda-row${isLast ? '' : ' agenda-row--border'}`}>
      <div className="agenda-row__content">
        <p className="agenda-row__title">
          <span className="agenda-row__id">{item.id}.</span> {item.title}
        </p>
        {item.sub && <p className="agenda-row__sub">{item.sub}</p>}
      </div>
      {item.badge && (
        <span className={`agenda-badge agenda-badge--${item.badge.type}`}>
          {item.badge.label}
        </span>
      )}
    </div>
  )
}

function ZoomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  )
}

function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="15" y2="17"/>
    </svg>
  )
}
