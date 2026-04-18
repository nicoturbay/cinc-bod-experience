import { useState } from 'react'
import './Feed.css'

// Figma assets (valid 7 days from extraction)
const CEPHAI_LOGO   = 'https://www.figma.com/api/mcp/asset/83bdb008-2873-425f-88f0-b4290762d291'
const RV_PHOTO      = 'https://www.figma.com/api/mcp/asset/76b3a23d-8da3-4de0-93b8-66aa165a49c1'
const AVATAR_1      = 'https://www.figma.com/api/mcp/asset/e728bdce-9abf-4948-8906-4a0005fe0ffd'
const AVATAR_2      = 'https://www.figma.com/api/mcp/asset/88bea4a5-b071-44f4-a690-1f7507b235d7'
const AVATAR_3      = 'https://www.figma.com/api/mcp/asset/a1ed2bc3-e9f8-405a-8322-64131508072c'
const AVATAR_4      = 'https://www.figma.com/api/mcp/asset/8f1df21e-40fd-4fb8-9840-df282e425f0d'
const LINKEDIN_AVT  = 'https://www.figma.com/api/mcp/asset/0bca9ca1-1bee-402d-b063-f060ebe66095'

const POSTS = [
  {
    id: 1,
    name: 'Darren Wilson',
    initials: 'DW',
    time: '5 minutes ago',
    isBoardMember: true,
    title: 'Important Decisions Ahead for Our Next Board Meeting',
    body: 'As we prepare for our upcoming board meeting, there are several important decisions on the table that will shape the direction of our community. From budget considerations to upcoming projects and policy updates, your input and awareness are key. We encourage everyone to review the agenda and stay informed as we work together to make the best choices for our association.',
    image: null,
    likes: 5,
    comments: 11,
    avatarImg: AVATAR_1,
  },
  {
    id: 2,
    name: 'Lisa Thomas',
    initials: 'LT',
    time: '1 Day Ago',
    isBoardMember: true,
    title: 'RV Parked on Sidewalk Under Review',
    body: 'An RV parked on the sidewalk has been identified and is currently under review. Updates will follow as needed.',
    image: RV_PHOTO,
    likes: 5,
    comments: 11,
    avatarImg: AVATAR_2,
  },
  {
    id: 3,
    name: 'Thomas Lowes',
    initials: 'TL',
    time: '3 Days Ago',
    isBoardMember: true,
    title: 'Request to Postpone April 17 Board Meeting',
    body: 'Would it be possible to move the April 17 board meeting to the following day? Please share your availability.',
    image: null,
    likes: 5,
    comments: 11,
    avatarImg: LINKEDIN_AVT,
  },
]

export default function Feed() {
  const [digestDismissed, setDigestDismissed] = useState(false)

  return (
    <div className="screen">
      <div className="screen-inner">

        {/* Engage bar */}
        <div className="engage-bar">
          <span className="engage-bar__text">Engage with Fellow Board Members</span>
          <div className="engage-bar__icons">
            <FilterIcon />
            <SortIcon />
          </div>
        </div>

        {/* Alert banner */}
        <div className="alert-banner">
          <BellAlertIcon />
          <p className="alert-banner__text">
            Meeting tonight at 5:30 PM via Zoom — 9 hearing decisions pending board vote
          </p>
          <ChevronRightIcon />
        </div>

        {/* CephAI Digest */}
        {!digestDismissed && (
          <div className="digest-card">
            <div className="digest-card__header">
              <div className="digest-card__author">
                <img src={CEPHAI_LOGO} alt="CephAI" className="digest-card__logo" />
                <div>
                  <p className="digest-card__name">CephAi</p>
                  <p className="digest-card__time">Now</p>
                </div>
              </div>
              <button
                className="digest-card__close"
                onClick={() => setDigestDismissed(true)}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>

            <p className="digest-card__title">Hello John, Your Daily Digest is ready</p>

            <div className="digest-card__body">
              <p>Since your last login, new invoices, ACC requests, and compliance updates have been processed and are ready for your review.</p>
              <p className="digest-card__bold">Today, your attention is needed for the following:</p>
              <ul className="digest-card__list">
                <li>Approve 5 new invoices</li>
                <li>Review 3 new ACC requests</li>
                <li>Review 2 ACC request status updates</li>
                <li>Review violation trends</li>
                <li>Review the board meeting agenda</li>
              </ul>
            </div>

            <button className="cta-btn">Let's Do This</button>
          </div>
        )}

        {/* Post feed */}
        {POSTS.map(post => (
          <PostCard key={post.id} post={post} />
        ))}

      </div>
    </div>
  )
}

function PostCard({ post }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="post-card card">
      {/* Post header */}
      <div className="post-card__header">
        <div className="post-avatar-wrap">
          <img src={post.avatarImg} alt={post.name} className="post-avatar" />
          {post.isBoardMember && (
            <div className="post-bm-badge" title="Board Member">BM</div>
          )}
        </div>
        <div className="post-card__meta">
          <span className="post-card__name">{post.name}</span>
          <span className="post-card__time">{post.time}</span>
        </div>
        <button className="post-card__menu" aria-label="More options">
          <DotsIcon />
        </button>
      </div>

      {/* Title */}
      <div className="post-card__content">
        <p className="post-card__title">{post.title}</p>
        <p className="post-card__body">{post.body}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="post-card__image">
          <img src={post.image} alt="Post" />
        </div>
      )}

      {/* Social row */}
      <div className="post-social">
        <div className="post-social__left">
          <div className="post-social__avatars">
            <img src={AVATAR_1} alt="" className="post-social__av" />
            <img src={AVATAR_2} alt="" className="post-social__av" />
            <img src={AVATAR_3} alt="" className="post-social__av" />
            <img src={AVATAR_4} alt="" className="post-social__av" />
          </div>
          <span className="post-social__liked-by">
            Liked by <strong>Liza Stevens</strong> and {post.likes - 1} others
          </span>
        </div>
        <div className="post-social__actions">
          <button
            className={`post-social__btn${liked ? ' post-social__btn--liked' : ''}`}
            onClick={() => setLiked(l => !l)}
          >
            <HeartIcon filled={liked} />
            <span>{liked ? post.likes + 1 : post.likes}</span>
          </button>
          <button className="post-social__btn">
            <CommentIcon />
            <span>{post.comments}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────── */
function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  )
}
function SortIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M7 12h10M10 18h4"/>
    </svg>
  )
}
function BellAlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#112719" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#112719" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}
function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="19" cy="12" r="1.5"/>
    </svg>
  )
}
function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#df434f' : 'none'} stroke={filled ? '#df434f' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}
function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
