import { useState } from 'react'
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
    voteContext: {
      description: 'Approve the April 5 meeting minutes, March financial statements, delinquency report ($84,210 total), and Q1 investment summary as presented.',
      tally: [
        { name: 'Sarah Mitchell', role: 'President', avatar: '/images/avatar-2.jpg', vote: 'aye' },
        { name: 'David Chen',     role: 'Treasurer', avatar: '/images/avatar-4.jpg', vote: 'aye' },
        { name: 'Lisa Thompson',  role: 'Secretary', avatar: '/images/avatar-linkedin.jpg', vote: null },
      ],
    },
  },
  {
    id: 'IV',
    title: 'New business',
    sub: 'Holiday lighting · Perimeter restroom',
    badge: { label: 'Vote', type: 'vote' },
    voteContext: {
      description: 'Approve holiday lighting contract with BrightScape LLC ($8,400) and authorize perimeter restroom renovation RFP up to $22,000.',
      tally: [
        { name: 'Sarah Mitchell', role: 'President', avatar: '/images/avatar-2.jpg', vote: 'aye' },
        { name: 'David Chen',     role: 'Treasurer', avatar: '/images/avatar-4.jpg', vote: 'nay' },
        { name: 'Lisa Thompson',  role: 'Secretary', avatar: '/images/avatar-linkedin.jpg', vote: null },
      ],
    },
  },
]

const EXEC_ITEMS = [
  {
    id: 'A',
    title: 'Exec session minutes',
    sub: null,
    badge: { label: 'Vote', type: 'vote' },
    voteContext: {
      description: 'Approve executive session minutes from the April 5, 2026 board meeting as presented.',
      tally: [
        { name: 'Sarah Mitchell', role: 'President', avatar: '/images/avatar-2.jpg', vote: 'aye' },
        { name: 'David Chen',     role: 'Treasurer', avatar: '/images/avatar-4.jpg', vote: 'aye' },
        { name: 'Lisa Thompson',  role: 'Secretary', avatar: '/images/avatar-linkedin.jpg', vote: 'aye' },
      ],
    },
  },
  {
    id: 'B',
    title: 'Violation hearings — 9 cases',
    sub: 'Tang, Chen, Ahluwalia + 6 more',
    badge: { label: 'Fines', type: 'fines' },
    voteContext: {
      description: 'Board vote required on fine amounts and compliance decisions for 9 scheduled hearings. Cases range from parking violations ($150) to unapproved structural modifications ($500).',
      tally: [
        { name: 'Sarah Mitchell', role: 'President', avatar: '/images/avatar-2.jpg', vote: null },
        { name: 'David Chen',     role: 'Treasurer', avatar: '/images/avatar-4.jpg', vote: null },
        { name: 'Lisa Thompson',  role: 'Secretary', avatar: '/images/avatar-linkedin.jpg', vote: null },
      ],
    },
  },
  {
    id: 'C',
    title: 'Delinquency decisions',
    sub: '4 accounts — lien & foreclosure',
    badge: { label: 'Auth', type: 'auth' },
    voteContext: {
      description: 'Authorize lien filing and/or foreclosure proceedings for 4 accounts past 90 days delinquent per CC&R Section 12.4. Total exposure: $31,600.',
      tally: [
        { name: 'Sarah Mitchell', role: 'President', avatar: '/images/avatar-2.jpg', vote: 'aye' },
        { name: 'David Chen',     role: 'Treasurer', avatar: '/images/avatar-4.jpg', vote: null },
        { name: 'Lisa Thompson',  role: 'Secretary', avatar: '/images/avatar-linkedin.jpg', vote: null },
      ],
    },
  },
  {
    id: 'D',
    title: 'Executive correspondence',
    sub: null,
    badge: { label: 'Info', type: 'info' },
  },
]

const VOTE_OPTIONS = [
  { key: 'aye',     label: 'Aye',     color: '#6bcb77', bg: 'rgba(107,203,119,0.12)', border: 'rgba(107,203,119,0.35)' },
  { key: 'nay',     label: 'Nay',     color: '#e05c5c', bg: 'rgba(224,92,92,0.12)',   border: 'rgba(224,92,92,0.35)' },
  { key: 'abstain', label: 'Abstain', color: '#8e8e8e', bg: 'rgba(142,142,142,0.10)', border: 'rgba(142,142,142,0.25)' },
]

export default function MeetingAgenda() {
  const [panel, setPanel] = useState(null)  // { item }
  const [votes, setVotes] = useState({})    // itemId -> 'aye'|'nay'|'abstain'

  function openPanel(item) {
    if (!item.voteContext) return
    setPanel({ item })
  }

  function submitVote(itemId, choice) {
    setVotes(v => ({ ...v, [itemId]: choice }))
    setPanel(null)
  }

  return (
    <div className="screen meeting-screen">
      <div className="meeting-inner">

        <div className="meeting-header">
          <h1 className="meeting-title">Board Meeting</h1>
          <p className="meeting-sub">April 19 · Zoom · 5:30 PM General · 6:30 PM Executive</p>
        </div>

        <div className="agenda-section">
          {GENERAL_ITEMS.map((item, i) => (
            <AgendaRow
              key={item.id}
              item={item}
              isLast={i === GENERAL_ITEMS.length - 1}
              voted={votes[item.id]}
              onTap={() => openPanel(item)}
            />
          ))}
        </div>

        <p className="agenda-section-label">Executive Session</p>
        <div className="agenda-section">
          {EXEC_ITEMS.map((item, i) => (
            <AgendaRow
              key={item.id}
              item={item}
              isLast={i === EXEC_ITEMS.length - 1}
              voted={votes[item.id]}
              onTap={() => openPanel(item)}
            />
          ))}
        </div>

        <div className="meeting-actions">
          <button className="meeting-btn meeting-btn--zoom" onClick={() => window.open('https://cincsystems.zoom.us/j/9196316136', '_blank')}>
            <ZoomIcon />
            Join Zoom
          </button>
          <a
            className="meeting-btn meeting-btn--pdf"
            href="/board-packet-apr-2026.pdf"
            download="Board-Packet-April-2026.pdf"
          >
            <PdfIcon />
            Download Board Packet
          </a>
        </div>

      </div>

      {panel && (
        <VotePanel
          item={panel.item}
          myVote={votes[panel.item.id]}
          onVote={choice => submitVote(panel.item.id, choice)}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  )
}

function AgendaRow({ item, isLast, voted, onTap }) {
  const tappable = !!item.voteContext
  return (
    <div
      className={`agenda-row${isLast ? '' : ' agenda-row--border'}${tappable ? ' agenda-row--tappable' : ''}`}
      onClick={tappable ? onTap : undefined}
    >
      <div className="agenda-row__content">
        <p className="agenda-row__title">
          <span className="agenda-row__id">{item.id}.</span> {item.title}
        </p>
        {item.sub && <p className="agenda-row__sub">{item.sub}</p>}
      </div>
      {voted ? (
        <span className={`agenda-badge agenda-badge--voted agenda-badge--voted-${voted}`}>
          <VotedCheckIcon /> {voted.charAt(0).toUpperCase() + voted.slice(1)}
        </span>
      ) : item.badge && (
        <span className={`agenda-badge agenda-badge--${item.badge.type}`}>
          {item.badge.label}
        </span>
      )}
      {tappable && !voted && <ChevronRightIcon />}
    </div>
  )
}

function VotePanel({ item, myVote, onVote, onClose }) {
  const [selected, setSelected] = useState(myVote || null)
  const ctx = item.voteContext

  const ayes    = ctx.tally.filter(m => m.vote === 'aye').length    + (selected === 'aye' ? 1 : 0)
  const nays    = ctx.tally.filter(m => m.vote === 'nay').length    + (selected === 'nay' ? 1 : 0)
  const abstains= ctx.tally.filter(m => m.vote === 'abstain').length+ (selected === 'abstain' ? 1 : 0)
  const total   = ctx.tally.length + 1

  return (
    <div className="vote-panel">
      {/* Header */}
      <div className="vote-panel__header">
        <button className="app-header__back" onClick={onClose} aria-label="Back">
          <ChevronLeftIcon />
        </button>
        <div className="app-header__hoa">
          <span className="app-header__hoa-name">Board Vote</span>
          <span className="inv-panel__page-title">{item.id}. {item.title}</span>
        </div>
      </div>
      <div className="app-header__divider" />

      <div className="vote-panel__body">

        {/* Context */}
        <div className="vote-panel__context">
          <p className="vote-panel__desc">{ctx.description}</p>
        </div>

        {/* Tally bar */}
        <div className="vote-panel__tally-section">
          <p className="vote-panel__section-label">Current Tally</p>
          <div className="vote-tally-bar">
            {ayes    > 0 && <div className="vote-tally-bar__seg vote-tally-bar__seg--aye"     style={{ flex: ayes }}     title={`${ayes} Aye`} />}
            {nays    > 0 && <div className="vote-tally-bar__seg vote-tally-bar__seg--nay"     style={{ flex: nays }}     title={`${nays} Nay`} />}
            {abstains> 0 && <div className="vote-tally-bar__seg vote-tally-bar__seg--abstain" style={{ flex: abstains }} title={`${abstains} Abstain`} />}
            {(ayes + nays + abstains) < total && (
              <div className="vote-tally-bar__seg vote-tally-bar__seg--pending" style={{ flex: total - ayes - nays - abstains }} />
            )}
          </div>
          <div className="vote-tally-legend">
            <span className="vote-tally-legend__item vote-tally-legend__item--aye">{ayes} Aye</span>
            <span className="vote-tally-legend__item vote-tally-legend__item--nay">{nays} Nay</span>
            {abstains > 0 && <span className="vote-tally-legend__item vote-tally-legend__item--abstain">{abstains} Abstain</span>}
            <span className="vote-tally-legend__item vote-tally-legend__item--pending">{total - ayes - nays - abstains} Pending</span>
          </div>
        </div>

        {/* Board members */}
        <div className="vote-panel__members-section">
          <p className="vote-panel__section-label">Board Members</p>
          <div className="vote-members">
            {ctx.tally.map((m, i) => (
              <div key={i} className="vote-member">
                <img src={m.avatar} alt={m.name} className="vote-member__avatar" />
                <div className="vote-member__info">
                  <span className="vote-member__name">{m.name}</span>
                  <span className="vote-member__role">{m.role}</span>
                </div>
                <span className={`vote-member__status vote-member__status--${m.vote || 'pending'}`}>
                  {m.vote ? m.vote.charAt(0).toUpperCase() + m.vote.slice(1) : 'Pending'}
                </span>
              </div>
            ))}
            {/* Current user row */}
            <div className="vote-member vote-member--you">
              <div className="vote-member__you-avatar">You</div>
              <div className="vote-member__info">
                <span className="vote-member__name">John Parker</span>
                <span className="vote-member__role">Vice President</span>
              </div>
              <span className={`vote-member__status vote-member__status--${selected || 'pending'}`}>
                {selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Vote buttons */}
        <div className="vote-panel__section-label">Cast Your Vote</div>
        <div className="vote-options">
          {VOTE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className={`vote-opt${selected === opt.key ? ' vote-opt--selected' : ''}`}
              style={{
                '--vopt-color':  opt.color,
                '--vopt-bg':     opt.bg,
                '--vopt-border': opt.border,
              }}
              onClick={() => setSelected(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

      </div>

      {/* Submit footer */}
      <div className="vote-panel__footer">
        <button
          className="vote-submit"
          style={selected ? { '--active': 1 } : undefined}
          disabled={!selected}
          onClick={() => onVote(selected)}
        >
          Submit Vote
        </button>
      </div>
    </div>
  )
}

/* ── Icon components ──────────────────────────────────── */
function ChevronLeftIcon() {
  return (
    <svg width="43" height="43" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function VotedCheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 3 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
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
