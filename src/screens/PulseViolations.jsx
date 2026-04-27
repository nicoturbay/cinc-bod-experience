import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMode } from '../ModeContext'
import AttachSvg   from '../ICONS/Attachment.svg'
import ChecklistSvg from '../ICONS/checklist.svg'
import LogSvg      from '../ICONS/log.svg'
import './PulseViolations.css'

/* ── Data ─────────────────────────────────────────────── */
const VIOL_TYPES = ['Parking', 'Landscaping', 'Architectural', 'Noise / nuisance', 'Trash / bins']

const TYPE_COLOR = {
  'Parking':          '#c05a35',
  'Landscaping':      '#4a7a4a',
  'Architectural':    '#9a8030',
  'Noise / nuisance': '#7a3535',
  'Trash / bins':     '#6a8a6a',
}

const TYPE_HERO = {
  'Parking':          '/images/card-workorder.jpg',
  'Landscaping':      '/images/card-violation.jpg',
  'Architectural':    '/images/card-acc.jpg',
  'Noise / nuisance': '/images/card-invoice.jpg',
  'Trash / bins':     '/images/card-task.jpg',
}

const STATUS_STYLE = {
  'Open':      { background: 'rgba(192,90,53,0.92)',  color: '#fff' },
  'Escalated': { background: 'rgba(200,50,50,0.92)',  color: '#fff' },
  'Cured':     { background: 'rgba(60,110,60,0.92)',  color: '#fff' },
}

const ALL_VIOLATIONS = [
  {
    id: 'v1',
    type: 'Trash / bins',
    address: '544 N Birch Ln',
    ownerName: 'Jessica Wong',
    acct: '1588-9914',
    date: '2026-04-25',
    level: '1st Notice',
    fineStarts: null,
    status: 'Open',
    description: 'Trash cans left at curb more than 24 hours after collection day, violating CC&R Section 6.1.',
    violationCount: 1,
    logCount: 1,
    attachment: 'img_544.png',
  },
  {
    id: 'v2',
    type: 'Noise / nuisance',
    address: '323 S Elm Dr',
    ownerName: 'Daniel & Susan Taylor',
    acct: '1588-4401',
    date: '2026-04-20',
    level: '2nd Notice',
    fineStarts: '2026-05-20',
    status: 'Open',
    description: 'Repeated loud music after 10 PM quiet hours on April 12, 17, and 19. Multiple neighbor complaints on file.',
    violationCount: 2,
    logCount: 3,
    attachment: 'noise_323.pdf',
  },
  {
    id: 'v3',
    type: 'Architectural',
    address: '156 W Oak Ln',
    ownerName: 'Thomas & Karen Anderson',
    acct: '1588-2278',
    date: '2026-04-19',
    level: '1st Notice',
    fineStarts: null,
    status: 'Open',
    description: 'Unapproved fence installation along north property line. No ACC application submitted prior to construction.',
    violationCount: 1,
    logCount: 2,
    attachment: 'img_156.png',
  },
  {
    id: 'v4',
    type: 'Parking',
    address: '314 Palm Cir',
    ownerName: 'Mark & Jennifer White',
    acct: '1588-7732',
    date: '2026-04-22',
    level: '1st Notice',
    fineStarts: null,
    status: 'Open',
    description: 'Vehicle blocking fire hydrant access on Palm Cir. Owner notified and vehicle relocated, second occurrence.',
    violationCount: 1,
    logCount: 1,
    attachment: 'img_314.png',
  },
  {
    id: 'v5',
    type: 'Parking',
    address: '502 S Birch Ln',
    ownerName: 'David Chen',
    acct: '1588-3391',
    date: '2026-04-18',
    level: '2nd Notice',
    fineStarts: '2026-05-18',
    status: 'Open',
    description: 'Oversized vehicle parked in street overnight on four consecutive nights, violating Rule 3.4.',
    violationCount: 2,
    logCount: 2,
    attachment: 'img_502.png',
  },
  {
    id: 'v6',
    type: 'Landscaping',
    address: '617 N Magnolia Ave',
    ownerName: 'Michael Davis',
    acct: '1588-6120',
    date: '2026-04-10',
    level: '1st Notice',
    fineStarts: null,
    status: 'Open',
    description: 'Front lawn not maintained — dead grass covers more than 30% of visible area, per CC&R Section 4.1.',
    violationCount: 1,
    logCount: 1,
    attachment: 'img_617.png',
  },
  {
    id: 'v7',
    type: 'Parking',
    address: '728 W Maple Ave',
    ownerName: 'Carlos Rivera',
    acct: '1588-8843',
    date: '2026-04-15',
    level: '1st Notice',
    fineStarts: null,
    status: 'Cured',
    description: 'Commercial vehicle parked in residential spot for five consecutive days. Vehicle removed after first notice.',
    violationCount: 1,
    logCount: 2,
    attachment: 'img_728.png',
  },
  {
    id: 'v8',
    type: 'Landscaping',
    address: '735 E Sierra Madre Ave',
    ownerName: 'Robert & Patricia Thompson',
    acct: '2745369636951',
    date: '2026-04-02',
    level: '3rd Notice — Fine Pending',
    fineStarts: '2026-05-08',
    status: 'Escalated',
    description: 'Overgrown vegetation blocking sidewalk access, violating CC&R Section 4.2. Notices issued Feb 14, Mar 12, Apr 1.',
    violationCount: 2,
    logCount: 4,
    attachment: 'img_735.png',
  },
  {
    id: 'v9',
    type: 'Architectural',
    address: '421 N Cherry St',
    ownerName: 'James & Mary Collins',
    acct: '1588-5509',
    date: '2026-04-07',
    level: '2nd Notice',
    fineStarts: '2026-05-07',
    status: 'Open',
    description: 'Exterior paint color not matching approved community palette. ACC-approved colors list provided at first notice.',
    violationCount: 1,
    logCount: 3,
    attachment: 'img_421.png',
  },
  {
    id: 'v10',
    type: 'Noise / nuisance',
    address: '879 W Ash Ct',
    ownerName: 'Robert Martinez',
    acct: '1588-1147',
    date: '2026-04-02',
    level: '1st Notice',
    fineStarts: null,
    status: 'Cured',
    description: 'Barking dog causing disturbance — seven complaints from neighboring units within a two-week period.',
    violationCount: 1,
    logCount: 2,
    attachment: 'img_879.pdf',
  },
  {
    id: 'v11',
    type: 'Parking',
    address: '441 N Cedar Dr',
    ownerName: 'Susan & Tom Baker',
    acct: '1588-6654',
    date: '2026-04-08',
    level: '1st Notice',
    fineStarts: null,
    status: 'Cured',
    description: 'Boat trailer parked on street without a temporary parking permit for seven days. Trailer removed after notice.',
    violationCount: 1,
    logCount: 1,
    attachment: 'img_441.png',
  },
  {
    id: 'v12',
    type: 'Landscaping',
    address: '209 W Juniper Ct',
    ownerName: 'Sarah & John Mitchell',
    acct: '1588-3382',
    date: '2026-04-03',
    level: '2nd Notice',
    fineStarts: '2026-05-03',
    status: 'Open',
    description: 'Dead palm tree not removed despite first notice issued March 1. Tree poses hazard per CC&R Section 4.5.',
    violationCount: 1,
    logCount: 2,
    attachment: 'img_209.png',
  },
  {
    id: 'v13',
    type: 'Parking',
    address: '163 E Willow St',
    ownerName: 'Patricia Moore',
    acct: '1588-9021',
    date: '2026-03-28',
    level: '1st Notice',
    fineStarts: null,
    status: 'Cured',
    description: 'Resident vehicle repeatedly parked in designated guest-only zone, blocking guest access.',
    violationCount: 1,
    logCount: 1,
    attachment: 'img_163.png',
  },
  {
    id: 'v14',
    type: 'Architectural',
    address: '667 E Poplar Ave',
    ownerName: 'William & Sandra Johnson',
    acct: '1588-4419',
    date: '2026-03-15',
    level: '2nd Notice',
    fineStarts: '2026-05-01',
    status: 'Open',
    description: 'Solar panels installed on roof without ACC approval. Installation predates current ACC requirements notification.',
    violationCount: 1,
    logCount: 3,
    attachment: 'acc_solar_667.pdf',
  },
  {
    id: 'v15',
    type: 'Landscaping',
    address: '882 E Sycamore Blvd',
    ownerName: 'Kevin & Linda Harris',
    acct: '1588-7723',
    date: '2026-03-21',
    level: '1st Notice',
    fineStarts: null,
    status: 'Cured',
    description: 'Excessive weeds and debris in front yard and on sidewalk area, violating maintenance standards in CC&R Section 4.1.',
    violationCount: 1,
    logCount: 1,
    attachment: 'img_882.png',
  },
]


/* ── Icons ────────────────────────────────────────────── */
function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}
function ChevronRowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
function SlidersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="8"  cy="6"  r="2" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

/* ── Main screen ──────────────────────────────────────── */
export default function PulseViolations() {
  const navigate = useNavigate()
  const { setCephAIPulseCount, setChatOpen, setCephAICardContext } = useMode()
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ types: new Set(), sort: 'newest' })
  const [holdingCard, setHoldingCard] = useState(null)
  const holdTimerRef = useRef(null)

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null }
    setHoldingCard(null)
  }, [])

  const startHold = useCallback((cardId) => {
    cancelHold()
    setHoldingCard(cardId)
    holdTimerRef.current = setTimeout(() => {
      setHoldingCard(null)
      setCephAICardContext(cardId)
      setCephAIPulseCount(c => c + 1)
      setTimeout(() => setChatOpen(true), 1800)
    }, 2500)
  }, [cancelHold, setCephAICardContext, setCephAIPulseCount, setChatOpen])

  function holdProps(cardId) {
    return {
      onPointerDown:  () => startHold(cardId),
      onPointerUp:    cancelHold,
      onPointerLeave: cancelHold,
      onPointerCancel: cancelHold,
      onContextMenu:  (e) => e.preventDefault(),
    }
  }

  const hasActive = filters.types.size > 0 || filters.sort !== 'newest'

  const visible = ALL_VIOLATIONS
    .filter(v => filters.types.size === 0 || filters.types.has(v.type))
    .sort((a, b) =>
      filters.sort === 'oldest'
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date)
    )

  return (
    <div className="screen">
      <div className="pv-page-header">
        <div className="meeting-header">
          <h1 className="meeting-title">All Violations</h1>
          <p className="meeting-sub">{visible.length} of {ALL_VIOLATIONS.length} · April 2026</p>
        </div>
        <button
          className={`engage-filter-btn${hasActive ? ' engage-filter-btn--active' : ''}`}
          onClick={() => setFilterOpen(true)}
        >
          <SlidersIcon />
        </button>
      </div>

      <div className="pv-list">
        {visible.map(v => (
          <ViolationCard
            key={v.id}
            violation={v}
            holding={holdingCard === v.id}
            holdProps={holdProps(v.id)}
          />
        ))}
      </div>

      {filterOpen && (
        <ViolFilter
          filters={filters}
          onChange={f => { setFilters(f); setFilterOpen(false) }}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  )
}

/* ── Violation card ───────────────────────────────────── */
function ViolationCard({ violation: v, holding, holdProps }) {
  const typeColor = TYPE_COLOR[v.type] ?? '#888'
  const statusStyle = STATUS_STYLE[v.status] ?? { background: 'rgba(128,128,128,0.9)', color: '#fff' }
  const heroSrc = TYPE_HERO[v.type] ?? '/images/card-violation.jpg'
  const initials = v.ownerName.split(/[\s&]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('')
  const dateStr = new Date(v.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className={`pv-card${holding ? ' card--holding' : ''}`} {...holdProps}>
      {/* Status badge — top-right on the card, same pattern as card-type-pill in Tasks */}
      <span className="pv-card__status-pill" style={statusStyle}>{v.status}</span>
      <div className="invoice-body">
        {/* Hero — uses Tasks.css .card-hero negative-margin bleed */}
        <div className="card-hero">
          <img src={heroSrc} className="card-hero__img" alt="" />
        </div>

        {/* Type row — same as inv-vendor in Tasks ViolationCardContent */}
        <div className="inv-vendor">
          <AlertIcon />
          <span className="inv-vendor__name viol-type" style={{ color: typeColor }}>{v.type}</span>
        </div>

        {/* Address + date */}
        <div className="pv-card__address-row">
          <span className="pv-card__address">{v.address}</span>
          <span className="pv-card__date">{dateStr}</span>
        </div>

        {/* Fields */}
        <div className="inv-fields">
          <div className="inv-field">
            <span className="inv-field__label">Acct:</span>
            <span className="inv-field__value">{v.acct}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Level:</span>
            <span className="inv-field__value">{v.level}</span>
          </div>
          {v.fineStarts && (
            <div className="inv-field">
              <span className="inv-field__label">Fine Starts:</span>
              <span className="inv-field__value inv-field__value--urgent">
                {new Date(v.fineStarts + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
          <div className="inv-field wo-description">{v.description}</div>
        </div>

        {/* Info rows */}
        <div className="inv-rows">
          <button className="inv-row">
            <span className="inv-row__icon viol-avatar">{initials}</span>
            <span className="inv-row__content">
              <span className="inv-row__title">{v.ownerName}</span>
              <span className="inv-row__sub">Home Owner</span>
            </span>
            <ChevronRowIcon />
          </button>
          <button className="inv-row">
            <span className="inv-row__icon">
              <img src={ChecklistSvg} className="inv-row__svg inv-row__svg--invert" alt="" />
            </span>
            <span className="inv-row__content">
              <span className="inv-row__title">Violation Items ({v.violationCount})</span>
            </span>
            <ChevronRowIcon />
          </button>
          <button className="inv-row">
            <span className="inv-row__icon"><img src={LogSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Log &amp; Notes</span>
            </span>
            {v.logCount > 0 && <span className="inv-row__badge">{v.logCount}</span>}
            <ChevronRowIcon />
          </button>
          <button className="inv-row inv-row--last">
            <span className="inv-row__icon"><img src={AttachSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">{v.attachment}</span>
            </span>
            <ChevronRowIcon />
          </button>
        </div>

        {/* Actions */}
        <div className="viol-actions">
          <button className="viol-btn viol-btn--comment">Add Comment</button>
          <button className="viol-btn viol-btn--note">Add Board Note</button>
        </div>
      </div>
    </div>
  )
}

/* ── Filter sheet ─────────────────────────────────────── */
function ViolFilter({ filters, onChange, onClose }) {
  const [draft, setDraft] = useState({ types: new Set(filters.types), sort: filters.sort })

  function toggleType(t) {
    setDraft(d => {
      const s = new Set(d.types)
      s.has(t) ? s.delete(t) : s.add(t)
      return { ...d, types: s }
    })
  }

  function apply() { onChange({ types: draft.types, sort: draft.sort }) }
  function clear()  { setDraft({ types: new Set(), sort: 'newest' }) }

  return (
    <div className="filter-sheet-wrap">
      <div className="filter-scrim" onClick={onClose} />
      <div className="filter-sheet">
        <div className="filter-sheet__header">
          <span className="filter-sheet__title">Filter Violations</span>
          <button className="filter-sheet__close" onClick={onClose}><CloseIcon /></button>
        </div>

        <p className="filter-section-label">Type</p>
        <div className="filter-chip-row">
          {VIOL_TYPES.map(t => (
            <button
              key={t}
              className={`filter-chip${draft.types.has(t) ? ' filter-chip--active' : ''}`}
              onClick={() => toggleType(t)}
              style={draft.types.has(t) ? {} : { borderColor: TYPE_COLOR[t] + '66', color: TYPE_COLOR[t] }}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="filter-section-label">Date Created</p>
        <div className="filter-chip-row">
          {[{ value: 'newest', label: 'Newest First' }, { value: 'oldest', label: 'Oldest First' }].map(opt => (
            <button
              key={opt.value}
              className={`filter-chip${draft.sort === opt.value ? ' filter-chip--active' : ''}`}
              onClick={() => setDraft(d => ({ ...d, sort: opt.value }))}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button className="filter-apply" onClick={apply}>Apply Filters</button>
        <button className="filter-clear" onClick={clear}>Clear All</button>
      </div>
    </div>
  )
}
