import { useState } from 'react'
import { useMode } from '../ModeContext'
import './Feed.css'

const CEPHAI_LOGO   = '/images/cephai-logo.svg'
const RV_PHOTO      = '/images/rv-photo.jpg'
const AVATAR_1      = '/images/avatar-1.jpg'
const AVATAR_2      = '/images/avatar-2.jpg'
const AVATAR_3      = '/images/avatar-3.jpg'
const AVATAR_4      = '/images/avatar-4.jpg'
const LINKEDIN_AVT  = '/images/avatar-linkedin.jpg'

const BOARD_POSTS = [
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
  const { isBoard } = useMode()
  return isBoard ? <BoardFeed /> : <ResidentFeed />
}

/* ── Board Experience Feed ──────────────────────────── */
function BoardFeed() {
  const [digestDismissed, setDigestDismissed] = useState(false)

  return (
    <div className="screen">
      <div className="screen-inner">

        <div className="engage-bar">
          <span className="engage-bar__text">Engage with Fellow Board Members</span>
          <div className="engage-bar__icons"><FilterIcon /><SortIcon /></div>
        </div>

        <div className="alert-banner">
          <BellAlertIcon />
          <p className="alert-banner__text">
            Meeting tonight at 5:30 PM via Zoom — 9 hearing decisions pending board vote
          </p>
          <ChevronRightIcon />
        </div>

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
              <button className="digest-card__close" onClick={() => setDigestDismissed(true)} aria-label="Dismiss">✕</button>
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
            <button className="cta-btn">LET'S DO THIS</button>
          </div>
        )}

        {BOARD_POSTS.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  )
}

/* ── Resident Experience Feed ───────────────────────── */
const RESIDENT_POSTS = [
  {
    id: 'r1',
    name: 'Dalton Thomson',
    initials: 'DT',
    time: '5 minutes ago',
    isBoardMember: true,
    title: 'Board Of Directors Election',
    body: 'The deadline to cast your vote is February 12. Just click in the button below and cast your vote.',
    image: RV_PHOTO,
    likes: 8,
    comments: 14,
    avatarImg: AVATAR_1,
  },
  {
    id: 'r2',
    name: 'Lisa Thomas',
    initials: 'LT',
    time: '1 Day Ago',
    isBoardMember: true,
    title: 'Community Pool Opening Soon',
    body: 'The pool will reopen May 1st with new hours: 8 AM – 9 PM daily. Please review the updated pool rules before your first visit.',
    image: null,
    likes: 5,
    comments: 11,
    avatarImg: AVATAR_2,
  },
]

function ResidentFeed() {
  return (
    <div className="screen">
      <div className="screen-inner">

        {/* Engage bar */}
        <div className="engage-bar">
          <span className="engage-bar__text">Engage With Your Neighbors</span>
          <div className="engage-bar__icons">
            <button className="engage-bar__icon-btn"><EditIcon /></button>
            <button className="engage-bar__icon-btn engage-bar__icon-btn--filled"><SlidersIcon /></button>
          </div>
        </div>

        {/* Account balance card */}
        <div className="acct-card">
          <div className="acct-card__top">
            <div className="acct-card__acct-row">
              <span className="acct-card__acct-label"><strong>Acct:</strong> 1588:6523</span>
              <ChevronRightSmallIcon />
            </div>
            <p className="acct-card__address">12346 Washington Avenue</p>
            <div className="acct-card__balance-row">
              <span className="acct-card__balance-label">Current Balance</span>
              <span className="acct-card__balance-dots" />
              <span className="acct-card__balance-amount">$750.41</span>
            </div>
          </div>
          <div className="acct-card__divider" />
          <div className="acct-card__autopay-row">
            <AutopayIcon />
            <span className="acct-card__autopay-text">Autopay scheduled for 03/01/2026</span>
            <ChevronRightSmallIcon />
          </div>
          <button className="acct-card__cta">MAKE A PAYMENT</button>
          <p className="acct-card__private">Only you can see this</p>
          <div className="acct-card__dots">
            <span className="acct-card__dot acct-card__dot--active" />
            <span className="acct-card__dot" />
            <span className="acct-card__dot" />
          </div>
        </div>

        {/* Community posts */}
        {RESIDENT_POSTS.map(post => <PostCard key={post.id} post={post} />)}

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
function ChevronRightSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}
function SlidersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
      <line x1="4" y1="12" x2="20" y2="12"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <line x1="4" y1="18" x2="20" y2="18"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>
  )
}
function AutopayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
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
