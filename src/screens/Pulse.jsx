import './Pulse.css'

const STATS = [
  {
    label: 'Collections',
    value: '$84,210',
    sub: '18 Delinquent Accounts',
    valueColor: 'red',
    subColor: 'red',
  },
  {
    label: 'Budget',
    value: '2.1% over',
    sub: 'Repairs + Landscaping',
    valueColor: 'red',
    subColor: 'amber',
  },
  {
    label: 'Violation Enforcement',
    value: '60%',
    sub: 'cure after 1st notice',
    valueColor: 'green',
    subColor: 'green',
  },
  {
    label: 'Reserve Fund Health',
    value: '68%',
    sub: '$412,750 funded',
    valueColor: 'white',
    subColor: 'muted',
  },
]

const VIOLATIONS = [
  { month: 'Nov', count: 26, pct: 68  },
  { month: 'Dec', count: 31, pct: 82  },
  { month: 'Jan', count: 38, pct: 100 },
  { month: 'Feb', count: 25, pct: 66  },
  { month: 'Mar', count: 19, pct: 50  },
  { month: 'Apr', count: 15, pct: 39  },
]

function barColor(pct) {
  if (pct >= 90) return '#df434f'
  if (pct >= 75) return '#df434f'
  if (pct >= 60) return '#efa41e'
  if (pct >= 45) return '#d4c53a'
  return '#3a913f'
}

export default function Pulse() {
  return (
    <div className="screen">
      <div className="screen-inner">

        {/* Title */}
        <div className="pulse-title-row">
          <div>
            <h1 className="pulse-title">Community Pulse</h1>
            <p className="pulse-sub">Live snapshot, updated continuously</p>
          </div>
          <button className="pulse-filter-btn" aria-label="Filter">
            <FilterIcon />
          </button>
        </div>

        {/* At a Glance */}
        <div>
          <p className="section-label">At a Glance</p>
          <div className="pulse-grid">
            {STATS.map(s => (
              <div key={s.label} className="pulse-stat card">
                <p className="pulse-stat__label">{s.label}</p>
                <p className={`pulse-stat__value pulse-stat__value--${s.valueColor}`}>{s.value}</p>
                <p className={`pulse-stat__sub pulse-stat__sub--${s.subColor}`}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Violations chart */}
        <div className="card violations-card">
          <p className="section-label" style={{ padding: '14px 16px 0', marginBottom: 4 }}>
            Violations Month Over Month
          </p>
          <div className="violations-chart">
            {VIOLATIONS.map(v => (
              <div key={v.month} className="violations-chart__row">
                <span className="violations-chart__month">{v.month}</span>
                <div className="violations-chart__bar-wrap">
                  <div
                    className="violations-chart__bar"
                    style={{ width: `${v.pct}%`, background: barColor(v.pct) }}
                  />
                </div>
                <span className="violations-chart__count">{v.count}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            <button className="cta-btn">Let's Do This</button>
          </div>
        </div>

      </div>
    </div>
  )
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  )
}
