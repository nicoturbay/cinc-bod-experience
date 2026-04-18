import './Home.css'

const STATS = [
  { label: 'Pending Approvals', value: '4', trend: '+2 this week', color: 'amber' },
  { label: 'Open Violations',   value: '11', trend: '-3 resolved', color: 'red' },
  { label: 'Reserve Fund',      value: '87%', trend: 'On track',   color: 'green' },
  { label: 'Next Meeting',      value: '3d',  trend: 'May 6, 2026', color: 'blue' },
]

const UPCOMING = [
  {
    id: 1,
    type: 'Meeting',
    title: 'Monthly BOD Meeting',
    date: 'May 6 · 7:00 PM',
    location: 'Clubhouse Room A',
    badge: 'upcoming',
  },
  {
    id: 2,
    type: 'Meeting',
    title: 'Budget Review Session',
    date: 'May 14 · 6:30 PM',
    location: 'Virtual — Zoom',
    badge: 'upcoming',
  },
  {
    id: 3,
    type: 'Meeting',
    title: 'Annual Meeting',
    date: 'Jun 3 · 6:00 PM',
    location: 'Ballroom B',
    badge: 'upcoming',
  },
]

const ACTIVITY = [
  { id: 1, icon: '✅', text: 'Landscape bid approved by 3 members', time: '2h ago' },
  { id: 2, icon: '📄', text: 'New violation filed — 142 Oak Ln', time: '5h ago' },
  { id: 3, icon: '💬', text: 'Comment posted on Pool Repairs item', time: '1d ago' },
  { id: 4, icon: '📥', text: 'Invoice uploaded: ABC Plumbing $2,400', time: '1d ago' },
  { id: 5, icon: '🏛️', text: 'Reserve study report added to Documents', time: '2d ago' },
]

export default function Home() {
  return (
    <div className="screen">
      <div className="screen-content">

        {/* Association pill */}
        <div className="home-assoc">
          <span className="home-assoc__dot" />
          Sunset Ridge HOA
          <span className="home-assoc__chevron">▾</span>
        </div>

        {/* Stats grid */}
        <div>
          <p className="section-title">At a Glance</p>
          <div className="home-stats">
            {STATS.map(s => (
              <div key={s.label} className={`home-stat home-stat--${s.color}`}>
                <span className="home-stat__value">{s.value}</span>
                <span className="home-stat__label">{s.label}</span>
                <span className="home-stat__trend">{s.trend}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="section-title">Quick Actions</p>
          <div className="scroll-row">
            {[
              { label: 'Review Approvals', emoji: '✅', color: '#e8f5ec' },
              { label: 'View Agenda',      emoji: '📋', color: '#ebf4ff' },
              { label: 'Check Budget',     emoji: '💰', color: '#fef3e2' },
              { label: 'Open Violations',  emoji: '⚠️',  color: '#fde8e8' },
            ].map(q => (
              <button key={q.label} className="home-quick" style={{ background: q.color }}>
                <span className="home-quick__emoji">{q.emoji}</span>
                <span className="home-quick__label">{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming meetings */}
        <div>
          <p className="section-title">Upcoming Meetings</p>
          <div className="card">
            {UPCOMING.map((m, i) => (
              <div key={m.id}>
                {i > 0 && <div className="divider" />}
                <div className="home-meeting-row">
                  <div className="home-meeting-cal">
                    <span className="home-meeting-cal__month">{m.date.split(' ')[0]}</span>
                    <span className="home-meeting-cal__day">{m.date.split(' ')[1].replace('·','')}</span>
                  </div>
                  <div className="home-meeting-info">
                    <span className="home-meeting-info__title">{m.title}</span>
                    <span className="home-meeting-info__meta">{m.date.split('·')[1]?.trim()} · {m.location}</span>
                  </div>
                  <span className="home-meeting-arrow">›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <p className="section-title">Recent Activity</p>
          <div className="card">
            {ACTIVITY.map((a, i) => (
              <div key={a.id}>
                {i > 0 && <div className="divider" />}
                <div className="home-activity-row">
                  <span className="home-activity-row__icon">{a.icon}</span>
                  <span className="home-activity-row__text">{a.text}</span>
                  <span className="home-activity-row__time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
