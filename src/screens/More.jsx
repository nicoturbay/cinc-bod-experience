import './More.css'

const MENU_SECTIONS = [
  {
    title: 'Community',
    items: [
      { emoji: '🏘️', label: 'Association Info',      sub: 'Cardinal Hills HOA' },
      { emoji: '📋', label: 'Governing Documents',    sub: 'CC&Rs, Bylaws, Rules' },
      { emoji: '📅', label: 'Meeting Schedule',       sub: 'Upcoming & past' },
      { emoji: '🔔', label: 'Announcements',          sub: '3 new' },
    ],
  },
  {
    title: 'Board Tools',
    items: [
      { emoji: '💰', label: 'Financial Reports',      sub: 'Budget & reserve' },
      { emoji: '🔧', label: 'Work Orders',            sub: '7 open' },
      { emoji: '🏗️', label: 'ACC Requests',          sub: '3 pending review' },
      { emoji: '⚠️', label: 'Violations',             sub: '15 active' },
      { emoji: '📊', label: 'Reports & Analytics',    sub: 'Full dashboard' },
    ],
  },
  {
    title: 'Account',
    items: [
      { emoji: '👤', label: 'My Profile',             sub: 'John Smith' },
      { emoji: '🔔', label: 'Notifications',          sub: 'Manage preferences' },
      { emoji: '🔒', label: 'Privacy & Security',     sub: null },
      { emoji: '❓', label: 'Help & Support',         sub: null },
    ],
  },
]

export default function More() {
  return (
    <div className="screen">
      <div className="screen-inner">

        {/* Profile card */}
        <div className="more-profile card">
          <div className="more-profile__avatar">JS</div>
          <div className="more-profile__info">
            <p className="more-profile__name">John Smith</p>
            <p className="more-profile__role">Board President · Cardinal Hills HOA</p>
          </div>
          <button className="more-profile__edit" aria-label="Edit profile">
            <EditIcon />
          </button>
        </div>

        {/* Sections */}
        {MENU_SECTIONS.map(section => (
          <div key={section.title}>
            <p className="section-label">{section.title}</p>
            <div className="card">
              {section.items.map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <div className="divider" />}
                  <button className="more-row">
                    <span className="more-row__emoji">{item.emoji}</span>
                    <div className="more-row__info">
                      <span className="more-row__label">{item.label}</span>
                      {item.sub && <span className="more-row__sub">{item.sub}</span>}
                    </div>
                    <ChevronIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button className="more-signout">Sign Out</button>

        <p className="more-version">CINC BOD Experience · v1.0 prototype</p>

      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}
