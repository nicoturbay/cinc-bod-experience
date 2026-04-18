import { useState } from 'react'
import './Meetings.css'

const TABS = ['Upcoming', 'Past', 'Agendas']

const UPCOMING = [
  {
    id: 1,
    title: 'Monthly BOD Meeting',
    date: 'May 6, 2026',
    time: '7:00 PM',
    location: 'Clubhouse Room A',
    status: 'confirmed',
    quorum: true,
    rsvp: 'attending',
    agenda: ['Approve April minutes', 'Landscape bid vote', 'Pool repair update', 'Open forum'],
  },
  {
    id: 2,
    title: 'Budget Review Session',
    date: 'May 14, 2026',
    time: '6:30 PM',
    location: 'Virtual — Zoom',
    status: 'confirmed',
    quorum: false,
    rsvp: null,
    agenda: ['2026 Q2 actuals', 'Reserve fund review', 'Capital projects'],
  },
  {
    id: 3,
    title: 'Annual HOA Meeting',
    date: 'Jun 3, 2026',
    time: '6:00 PM',
    location: 'Ballroom B',
    status: 'draft',
    quorum: false,
    rsvp: null,
    agenda: ['Board elections', 'Annual financial report', 'Community vote on amenities'],
  },
]

const PAST = [
  { id: 4, title: 'Monthly BOD Meeting', date: 'Apr 1, 2026', attendees: 5, hasMinutes: true },
  { id: 5, title: 'Emergency Session — Pipe Burst', date: 'Mar 18, 2026', attendees: 4, hasMinutes: true },
  { id: 6, title: 'Monthly BOD Meeting', date: 'Mar 4, 2026', attendees: 5, hasMinutes: true },
  { id: 7, title: 'Monthly BOD Meeting', date: 'Feb 4, 2026', attendees: 3, hasMinutes: false },
]

export default function Meetings() {
  const [tab, setTab] = useState(0)
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="screen">
      <div className="screen-content">

        {/* Tabs */}
        <div className="seg-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`seg-tabs__btn${tab === i ? ' seg-tabs__btn--active' : ''}`}
              onClick={() => setTab(i)}
            >{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {UPCOMING.map(m => (
              <div key={m.id} className="card meeting-card">
                <div className="meeting-card__header" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                  <div className="meeting-card__meta">
                    <span className={`badge badge--${m.status === 'confirmed' ? 'green' : 'gray'}`}>
                      {m.status === 'confirmed' ? 'Confirmed' : 'Draft'}
                    </span>
                    {m.quorum && <span className="badge badge--blue">Quorum met</span>}
                  </div>
                  <h3 className="meeting-card__title">{m.title}</h3>
                  <div className="meeting-card__datetime">
                    <span>📅 {m.date} at {m.time}</span>
                    <span>📍 {m.location}</span>
                  </div>
                  <div className="meeting-card__chevron">{expanded === m.id ? '▲' : '▼'}</div>
                </div>

                {expanded === m.id && (
                  <div className="meeting-card__body">
                    <div className="divider" />
                    <div className="meeting-agenda">
                      <p className="section-title" style={{ marginBottom: 6 }}>Agenda Items</p>
                      {m.agenda.map((item, i) => (
                        <div key={i} className="meeting-agenda__item">
                          <span className="meeting-agenda__num">{i + 1}</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="divider" />
                    <div className="meeting-rsvp">
                      <p className="section-title" style={{ marginBottom: 8 }}>Your RSVP</p>
                      <div className="meeting-rsvp__btns">
                        {['attending', 'not attending', 'maybe'].map(r => (
                          <RsvpBtn key={r} label={r} active={m.rsvp === r} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <div className="card">
            {PAST.map((m, i) => (
              <div key={m.id}>
                {i > 0 && <div className="divider" />}
                <div className="past-meeting-row">
                  <div className="past-meeting-row__info">
                    <span className="past-meeting-row__title">{m.title}</span>
                    <span className="past-meeting-row__meta">{m.date} · {m.attendees} attendees</span>
                  </div>
                  {m.hasMinutes
                    ? <button className="past-meeting-row__btn">Minutes ↗</button>
                    : <span className="badge badge--gray">No minutes</span>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {UPCOMING.filter(m => m.agenda.length).map(m => (
              <div key={m.id} className="card agenda-card">
                <div className="agenda-card__head">
                  <span className="agenda-card__title">{m.title}</span>
                  <span className="agenda-card__date">{m.date}</span>
                </div>
                <div className="divider" />
                {m.agenda.map((item, i) => (
                  <div key={i} className="agenda-card__item">
                    <span className="agenda-card__num">{i + 1}</span>
                    <span className="agenda-card__text">{item}</span>
                    <span className="agenda-card__arrow">›</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function RsvpBtn({ label, active }) {
  const emoji = label === 'attending' ? '✅' : label === 'not attending' ? '❌' : '🤔'
  return (
    <button className={`rsvp-btn${active ? ' rsvp-btn--active' : ''}`}>
      {emoji} {label.charAt(0).toUpperCase() + label.slice(1)}
    </button>
  )
}
