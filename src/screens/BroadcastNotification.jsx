import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './BroadcastNotification.css'

const SECTION_CHIPS   = ['All Sections', 'North Side', 'South Side', 'East Side', 'West Side', 'Common Areas']
const PERSONA_CHIPS   = ['Owners', 'Residents', 'Tenants']
const COMMITTEE_CHIPS = ['Board of Directors', 'Architectural Committee', 'Financial Committee', 'Violations Committee', 'Maintenance Committee']
const DELIVERY_OPTIONS = ['SMS', 'Email', 'Push Notification']

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

export default function BroadcastAudience() {
  const navigate = useNavigate()
  const { state } = useLocation()

  // Pre-populate from compose screen state (if returning to edit)
  const [sections,   setSections]   = useState(state?.sections   ?? [])
  const [personas,   setPersonas]   = useState(state?.personas   ?? [])
  const [committees, setCommittees] = useState(state?.committees ?? [])
  const [delivery,   setDelivery]   = useState(state?.delivery   ?? [])

  const hasAudience    = sections.length > 0 || personas.length > 0 || committees.length > 0
  const estimatedCount = sections.length * 45 + personas.length * 88 + committees.length * 6
  const canDone        = hasAudience && delivery.length > 0

  function handleDone() {
    navigate('/broadcast', {
      state: {
        sections, personas, committees, delivery, estimatedCount,
        // echo back compose fields so they aren't lost
        subject: state?.subject ?? '',
        message: state?.message ?? '',
      },
      replace: true,
    })
  }

  return (
    <div className="screen">
      <div className="screen-inner">

        <div className="bc-page-header">
          <div className="bc-page-title">Build Audience</div>
          <div className="bc-page-sub">Select who will receive this broadcast</div>
        </div>

        {/* Audience */}
        <div className="bc-card">
          <div className="bc-card__title">Association Section</div>
          <div className="bc-chips">
            {SECTION_CHIPS.map(chip => (
              <button
                key={chip}
                className={`bc-chip${sections.includes(chip) ? ' bc-chip--on' : ''}`}
                onClick={() => setSections(toggle(sections, chip))}
              >{chip}</button>
            ))}
          </div>
        </div>

        <div className="bc-card">
          <div className="bc-card__title">Persona</div>
          <div className="bc-chips">
            {PERSONA_CHIPS.map(chip => (
              <button
                key={chip}
                className={`bc-chip${personas.includes(chip) ? ' bc-chip--on' : ''}`}
                onClick={() => setPersonas(toggle(personas, chip))}
              >{chip}</button>
            ))}
          </div>
        </div>

        <div className="bc-card">
          <div className="bc-card__title">Committees</div>
          <div className="bc-chips">
            {COMMITTEE_CHIPS.map(chip => (
              <button
                key={chip}
                className={`bc-chip${committees.includes(chip) ? ' bc-chip--on' : ''}`}
                onClick={() => setCommittees(toggle(committees, chip))}
              >{chip}</button>
            ))}
          </div>
        </div>

        <div className="bc-card">
          <div className="bc-card__title">Delivery Method</div>
          <div className="bc-chips">
            {DELIVERY_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`bc-chip bc-chip--delivery${delivery.includes(opt) ? ' bc-chip--on' : ''}`}
                onClick={() => setDelivery(toggle(delivery, opt))}
              >
                <DeliveryIcon type={opt} />
                {opt}
              </button>
            ))}
          </div>
        </div>

        {hasAudience && (
          <p className="bc-estimate">
            Estimated reach: <strong>~{estimatedCount} recipients</strong>
          </p>
        )}

        <button
          className={`bc-next-btn${!canDone ? ' bc-btn--disabled' : ''}`}
          onClick={handleDone}
        >
          <CheckIcon />
          Done — Return to Compose
        </button>

      </div>
    </div>
  )
}

function DeliveryIcon({ type }) {
  const p = { width:18, height:18, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:'1.8', strokeLinecap:'round', strokeLinejoin:'round' }
  if (type === 'SMS')   return <svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  if (type === 'Email') return <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  return <svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
