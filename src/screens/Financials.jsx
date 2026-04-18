import { useState } from 'react'
import './Financials.css'

const BUDGET_ITEMS = [
  { category: 'Landscaping',   budget: 48000, actual: 36200, pct: 75 },
  { category: 'Pool & Amenities', budget: 22000, actual: 19800, pct: 90 },
  { category: 'Insurance',     budget: 31000, actual: 31000, pct: 100 },
  { category: 'Administration',budget: 15000, actual: 8750,  pct: 58 },
  { category: 'Maintenance',   budget: 40000, actual: 28300, pct: 71 },
  { category: 'Utilities',     budget: 18000, actual: 14200, pct: 79 },
]

const INVOICES = [
  { id: 1, vendor: 'GreenScape LLC',    amount: 3800, date: 'Apr 28', status: 'pending',  category: 'Landscaping' },
  { id: 2, vendor: 'AquaCare Pool Svc', amount: 1250, date: 'Apr 25', status: 'approved', category: 'Pool' },
  { id: 3, vendor: 'ABC Plumbing',      amount: 2400, date: 'Apr 22', status: 'pending',  category: 'Maintenance' },
  { id: 4, vendor: 'SecureIt Alarm',    amount:  480, date: 'Apr 20', status: 'paid',     category: 'Admin' },
  { id: 5, vendor: 'PowerGrid Elec.',   amount: 1840, date: 'Apr 18', status: 'paid',     category: 'Utilities' },
]

const STATUS_BADGE = {
  pending:  'badge--amber',
  approved: 'badge--blue',
  paid:     'badge--green',
}

export default function Financials() {
  const [tab, setTab] = useState(0)

  const totalBudget = BUDGET_ITEMS.reduce((s, i) => s + i.budget, 0)
  const totalActual = BUDGET_ITEMS.reduce((s, i) => s + i.actual, 0)
  const overallPct  = Math.round((totalActual / totalBudget) * 100)

  return (
    <div className="screen">
      <div className="screen-content">

        {/* Reserve fund summary */}
        <div className="reserve-card card">
          <div className="reserve-card__top">
            <div>
              <p className="reserve-card__label">Reserve Fund</p>
              <p className="reserve-card__value">$847,200</p>
              <p className="reserve-card__sub">87% funded · Target $975,000</p>
            </div>
            <div className="reserve-card__ring">
              <svg viewBox="0 0 64 64" width="64" height="64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="var(--gray-light)" strokeWidth="8"/>
                <circle cx="32" cy="32" r="26" fill="none" stroke="var(--green-lime)" strokeWidth="8"
                  strokeDasharray={`${0.87 * 163.4} 163.4`}
                  strokeLinecap="round"
                  transform="rotate(-90 32 32)"
                />
              </svg>
              <span className="reserve-card__ring-pct">87%</span>
            </div>
          </div>
          <div className="reserve-card__pills">
            <div className="reserve-pill reserve-pill--green">
              <span>YTD Income</span>
              <strong>$156,800</strong>
            </div>
            <div className="reserve-pill reserve-pill--amber">
              <span>YTD Expenses</span>
              <strong>$138,250</strong>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="seg-tabs">
          {['Budget', 'Invoices'].map((t, i) => (
            <button
              key={t}
              className={`seg-tabs__btn${tab === i ? ' seg-tabs__btn--active' : ''}`}
              onClick={() => setTab(i)}
            >{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div>
            {/* Overall bar */}
            <div className="card budget-summary">
              <div className="budget-summary__row">
                <span className="budget-summary__label">Overall Budget Usage</span>
                <span className="budget-summary__pct">{overallPct}%</span>
              </div>
              <div className="budget-bar">
                <div className="budget-bar__fill" style={{ width: `${overallPct}%`, background: overallPct > 90 ? 'var(--red)' : overallPct > 75 ? 'var(--amber)' : 'var(--green-lime)' }} />
              </div>
              <div className="budget-summary__totals">
                <span>${totalActual.toLocaleString()} spent</span>
                <span>of ${totalBudget.toLocaleString()}</span>
              </div>
            </div>

            {/* Per-category */}
            <div className="card" style={{ marginTop: 10 }}>
              {BUDGET_ITEMS.map((item, i) => (
                <div key={item.category}>
                  {i > 0 && <div className="divider" />}
                  <div className="budget-item">
                    <div className="budget-item__top">
                      <span className="budget-item__name">{item.category}</span>
                      <span className="budget-item__pct" style={{ color: item.pct > 90 ? 'var(--red)' : item.pct > 75 ? 'var(--amber)' : 'var(--green-mid)' }}>
                        {item.pct}%
                      </span>
                    </div>
                    <div className="budget-bar" style={{ margin: '4px 0' }}>
                      <div className="budget-bar__fill" style={{
                        width: `${item.pct}%`,
                        background: item.pct > 90 ? 'var(--red)' : item.pct > 75 ? 'var(--amber)' : 'var(--green-lime)'
                      }} />
                    </div>
                    <div className="budget-item__amounts">
                      <span>${item.actual.toLocaleString()} spent</span>
                      <span>${item.budget.toLocaleString()} budget</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div className="card">
            {INVOICES.map((inv, i) => (
              <div key={inv.id}>
                {i > 0 && <div className="divider" />}
                <div className="invoice-row">
                  <div className="invoice-row__left">
                    <span className="invoice-row__vendor">{inv.vendor}</span>
                    <span className="invoice-row__meta">{inv.date} · {inv.category}</span>
                  </div>
                  <div className="invoice-row__right">
                    <span className="invoice-row__amount">${inv.amount.toLocaleString()}</span>
                    <span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
