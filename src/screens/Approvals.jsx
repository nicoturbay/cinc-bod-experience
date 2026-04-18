import { useState } from 'react'
import './Approvals.css'

const APPROVALS = [
  {
    id: 1,
    type: 'Work Order',
    title: 'Pool Pump Replacement',
    vendor: 'AquaCare Services',
    amount: 4200,
    submitted: 'Apr 29, 2026',
    priority: 'urgent',
    description: 'Main pool circulation pump has failed. Replacement required before weekend swim season opening. Vendor quote attached.',
    votes: { yes: 2, no: 0, total: 5 },
    myVote: null,
  },
  {
    id: 2,
    type: 'Vendor Contract',
    title: 'Landscape Maintenance — Annual Renewal',
    vendor: 'GreenScape LLC',
    amount: 48000,
    submitted: 'Apr 27, 2026',
    priority: 'normal',
    description: 'Annual renewal of landscaping contract. 3% rate increase from prior year. Contract runs June 2026 – May 2027.',
    votes: { yes: 3, no: 1, total: 5 },
    myVote: 'yes',
  },
  {
    id: 3,
    type: 'Capital Project',
    title: 'Clubhouse Roof Repair',
    vendor: 'Summit Roofing Co.',
    amount: 18500,
    submitted: 'Apr 24, 2026',
    priority: 'normal',
    description: 'Roof inspection revealed deteriorating flashing and two sections of damaged shingles. Repair needed before rainy season.',
    votes: { yes: 1, no: 2, total: 5 },
    myVote: 'no',
  },
  {
    id: 4,
    type: 'Policy Change',
    title: 'Short-Term Rental Policy Update',
    vendor: null,
    amount: null,
    submitted: 'Apr 20, 2026',
    priority: 'low',
    description: 'Proposed amendment to CC&Rs to clarify short-term rental restrictions (under 30 days). Legal review completed.',
    votes: { yes: 0, no: 0, total: 5 },
    myVote: null,
  },
]

const PRIORITY_BADGE = {
  urgent: 'badge--red',
  normal: 'badge--amber',
  low:    'badge--gray',
}
const TYPE_EMOJI = {
  'Work Order':     '🔧',
  'Vendor Contract':'📝',
  'Capital Project':'🏗️',
  'Policy Change':  '📋',
}

export default function Approvals() {
  const [items, setItems] = useState(APPROVALS)
  const [expanded, setExpanded] = useState(null)

  function vote(id, v) {
    setItems(prev => prev.map(item => item.id !== id ? item : {
      ...item,
      myVote: item.myVote === v ? null : v,
      votes: {
        ...item.votes,
        yes: item.votes.yes + (v === 'yes' ? (item.myVote === 'yes' ? -1 : 1) : item.myVote === 'yes' ? -1 : 0),
        no:  item.votes.no  + (v === 'no'  ? (item.myVote === 'no'  ? -1 : 1) : item.myVote === 'no'  ? -1 : 0),
      }
    }))
  }

  const pending = items.filter(i => i.myVote === null).length

  return (
    <div className="screen">
      <div className="screen-content">

        {/* Summary bar */}
        <div className="approvals-summary">
          <div className="approvals-summary__stat">
            <span className="approvals-summary__num" style={{ color: 'var(--red)' }}>{pending}</span>
            <span className="approvals-summary__lbl">Need your vote</span>
          </div>
          <div className="approvals-summary__divider" />
          <div className="approvals-summary__stat">
            <span className="approvals-summary__num" style={{ color: 'var(--green-mid)' }}>{items.filter(i => i.myVote === 'yes').length}</span>
            <span className="approvals-summary__lbl">You approved</span>
          </div>
          <div className="approvals-summary__divider" />
          <div className="approvals-summary__stat">
            <span className="approvals-summary__num" style={{ color: 'var(--gray-dark)' }}>{items.filter(i => i.myVote === 'no').length}</span>
            <span className="approvals-summary__lbl">You declined</span>
          </div>
        </div>

        {/* Items */}
        {items.map(item => (
          <div key={item.id} className="card approval-card">
            <div className="approval-card__header" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
              <div className="approval-card__type-row">
                <span className="approval-card__emoji">{TYPE_EMOJI[item.type]}</span>
                <span className="badge badge--gray" style={{ fontSize: 10 }}>{item.type}</span>
                <span className={`badge ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span>
              </div>
              <h3 className="approval-card__title">{item.title}</h3>
              <div className="approval-card__meta">
                {item.vendor && <span>🏢 {item.vendor}</span>}
                {item.amount && <span>💰 ${item.amount.toLocaleString()}</span>}
                <span>📅 {item.submitted}</span>
              </div>

              {/* Vote progress */}
              <div className="vote-progress">
                <div className="vote-progress__bar">
                  <div className="vote-progress__yes" style={{ width: `${(item.votes.yes / item.votes.total) * 100}%` }} />
                  <div className="vote-progress__no"  style={{ width: `${(item.votes.no  / item.votes.total) * 100}%`, marginLeft: 'auto' }} />
                </div>
                <div className="vote-progress__counts">
                  <span className="vote-progress__yes-count">✅ {item.votes.yes} yes</span>
                  <span className="vote-progress__label">{item.votes.total} members</span>
                  <span className="vote-progress__no-count">❌ {item.votes.no} no</span>
                </div>
              </div>
            </div>

            {expanded === item.id && (
              <div className="approval-card__body">
                <div className="divider" />
                <p className="approval-card__description">{item.description}</p>
                <div className="divider" />
                <div className="approval-card__actions">
                  <button
                    className={`vote-btn vote-btn--no${item.myVote === 'no' ? ' vote-btn--active-no' : ''}`}
                    onClick={() => vote(item.id, 'no')}
                  >
                    ❌ Decline
                  </button>
                  <button
                    className={`vote-btn vote-btn--yes${item.myVote === 'yes' ? ' vote-btn--active-yes' : ''}`}
                    onClick={() => vote(item.id, 'yes')}
                  >
                    ✅ Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  )
}
