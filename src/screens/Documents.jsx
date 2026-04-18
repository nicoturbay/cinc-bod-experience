import { useState } from 'react'
import './Documents.css'

const CATEGORIES = ['All', 'Governing', 'Financial', 'Meetings', 'Contracts']

const DOCS = [
  { id: 1, title: 'CC&Rs — Sunset Ridge HOA',        category: 'Governing',  date: 'Jan 2022', size: '2.4 MB', type: 'pdf',  pinned: true },
  { id: 2, title: 'Bylaws (Amended)',                 category: 'Governing',  date: 'Mar 2023', size: '1.1 MB', type: 'pdf',  pinned: true },
  { id: 3, title: 'Rules & Regulations',              category: 'Governing',  date: 'Jun 2024', size: '890 KB', type: 'pdf',  pinned: false },
  { id: 4, title: '2026 Annual Budget',               category: 'Financial',  date: 'Jan 2026', size: '340 KB', type: 'xlsx', pinned: true },
  { id: 5, title: 'Reserve Study Report',             category: 'Financial',  date: 'Nov 2025', size: '5.2 MB', type: 'pdf',  pinned: false },
  { id: 6, title: 'Apr 2026 — BOD Meeting Minutes',   category: 'Meetings',   date: 'Apr 2026', size: '210 KB', type: 'pdf',  pinned: false },
  { id: 7, title: 'Mar 2026 — BOD Meeting Minutes',   category: 'Meetings',   date: 'Mar 2026', size: '195 KB', type: 'pdf',  pinned: false },
  { id: 8, title: 'Feb 2026 — BOD Meeting Minutes',   category: 'Meetings',   date: 'Feb 2026', size: '220 KB', type: 'pdf',  pinned: false },
  { id: 9, title: 'GreenScape LLC — Service Contract',category: 'Contracts',  date: 'Jun 2025', size: '480 KB', type: 'pdf',  pinned: false },
  { id:10, title: 'AquaCare — Pool Service Contract', category: 'Contracts',  date: 'Jan 2026', size: '310 KB', type: 'pdf',  pinned: false },
]

const TYPE_ICON = {
  pdf:  { bg: '#fde8e8', color: '#c53030', label: 'PDF' },
  xlsx: { bg: '#e6fffa', color: '#276749', label: 'XLS' },
  docx: { bg: '#ebf4ff', color: '#2b6cb0', label: 'DOC' },
}

export default function Documents() {
  const [activecat, setActivecat] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = DOCS.filter(d =>
    (activecat === 'All' || d.category === activecat) &&
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  const pinned = filtered.filter(d => d.pinned)
  const rest   = filtered.filter(d => !d.pinned)

  return (
    <div className="screen">
      <div className="screen-content">

        {/* Search */}
        <div className="doc-search">
          <span className="doc-search__icon">🔍</span>
          <input
            className="doc-search__input"
            placeholder="Search documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="doc-search__clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Category chips */}
        <div className="scroll-row" style={{ paddingBottom: 2 }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`cat-chip${activecat === c ? ' cat-chip--active' : ''}`}
              onClick={() => setActivecat(c)}
            >{c}</button>
          ))}
        </div>

        {/* Pinned */}
        {pinned.length > 0 && !search && (
          <div>
            <p className="section-title">📌 Pinned</p>
            <div className="card">
              {pinned.map((doc, i) => (
                <div key={doc.id}>
                  {i > 0 && <div className="divider" />}
                  <DocRow doc={doc} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rest */}
        {rest.length > 0 && (
          <div>
            {!search && <p className="section-title">All Documents</p>}
            <div className="card">
              {rest.map((doc, i) => (
                <div key={doc.id}>
                  {i > 0 && <div className="divider" />}
                  <DocRow doc={doc} />
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="doc-empty">
            <span>📂</span>
            <p>No documents found</p>
          </div>
        )}

        {/* Upload CTA */}
        <button className="doc-upload-btn">
          ＋ Upload Document
        </button>

      </div>
    </div>
  )
}

function DocRow({ doc }) {
  const ti = TYPE_ICON[doc.type] ?? TYPE_ICON.pdf
  return (
    <div className="doc-row">
      <div className="doc-row__badge" style={{ background: ti.bg, color: ti.color }}>
        {ti.label}
      </div>
      <div className="doc-row__info">
        <span className="doc-row__title">{doc.title}</span>
        <span className="doc-row__meta">{doc.date} · {doc.size}</span>
      </div>
      <button className="doc-row__action" aria-label="Open document">↗</button>
    </div>
  )
}
