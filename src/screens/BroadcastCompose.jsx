import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMode } from '../ModeContext'
import './BroadcastNotification.css'

export default function BroadcastCompose() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { setCephAIPulseCount, broadcastDraft, setBroadcastDraft } = useMode()
  const fileInputRef = useRef(null)

  // Audience — populated when returning from /broadcast/audience
  const sections       = state?.sections      ?? []
  const personas       = state?.personas      ?? []
  const committees     = state?.committees    ?? []
  const delivery       = state?.delivery      ?? []
  const estimatedCount = state?.estimatedCount ?? 0

  // Compose fields — restored from state when returning from audience builder
  const [subject,      setSubject]      = useState(state?.subject ?? '')
  const [message,      setMessage]      = useState(state?.message ?? '')
  const [files,        setFiles]        = useState([])
  const [scheduled,    setScheduled]    = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [sent,         setSent]         = useState(false)

  // Trigger CephAI ring animation on mount
  useEffect(() => {
    const t = setTimeout(() => setCephAIPulseCount(c => c + 1), 700)
    return () => clearTimeout(t)
  }, [])

  // Consume draft inserted by CephAI
  useEffect(() => {
    if (broadcastDraft) {
      setSubject(broadcastDraft.subject ?? '')
      setMessage(broadcastDraft.message ?? '')
      setBroadcastDraft(null)
    }
  }, [broadcastDraft])

  const hasAudience = sections.length > 0 || personas.length > 0 || committees.length > 0
  const canSend     = subject.trim().length > 0 && message.trim().length > 0

  const audienceParts = [...sections, ...personas, ...committees]
  const audienceSummary = audienceParts.length > 0
    ? `${audienceParts.slice(0, 3).join(', ')}${audienceParts.length > 3 ? ` +${audienceParts.length - 3} more` : ''} · ~${estimatedCount} recipients`
    : null

  function goToAudience() {
    navigate('/broadcast/audience', {
      state: { subject, message, sections, personas, committees, delivery, estimatedCount },
    })
  }

  function handleFileChange(e) {
    const picked = Array.from(e.target.files)
    setFiles(prev => [...prev, ...picked])
    e.target.value = ''
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  if (sent) {
    const isScheduled = scheduled && scheduleDate
    return (
      <div className="screen" style={{ position: 'relative' }}>
        <div className="bc-success">
          <div className="bc-success__ring"><CheckIcon /></div>
          <div className="bc-success__title">
            {isScheduled ? 'Broadcast Scheduled!' : 'Broadcast Sent!'}
          </div>
          <div className="bc-success__sub">
            {isScheduled
              ? `Scheduled for ${scheduleDate}${scheduleTime ? ` at ${scheduleTime}` : ''}${delivery.length ? ` via ${delivery.join(', ')}` : ''}.`
              : `Message delivered to ~${estimatedCount || 'all'} recipients${delivery.length ? ` via ${delivery.join(', ')}` : ''}.`}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="screen-inner">

        <div className="bc-page-header">
          <div className="bc-page-title">Send Broadcast</div>
        </div>

        {/* Audience tap section */}
        <button className="bc-audience-row" onClick={goToAudience}>
          <div className="bc-audience-row__left">
            <AudienceIcon />
            <div className="bc-audience-row__text">
              <span className="bc-audience-row__label">AUDIENCE</span>
              {audienceSummary
                ? <span className="bc-audience-row__summary">{audienceSummary}</span>
                : <span className="bc-audience-row__empty">Tap to build your audience</span>
              }
            </div>
          </div>
          <ChevronRightIcon active={hasAudience} />
        </button>

        {/* Compose card */}
        <div className="bc-card">

          <div className="bc-field">
            <label className="bc-field-label">Subject</label>
            <input
              className="bc-input"
              type="text"
              placeholder="e.g. Community Pool Update"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="bc-divider" />

          <div className="bc-field">
            <label className="bc-field-label">Message</label>
            <textarea
              className="bc-textarea"
              placeholder="Write your broadcast message here…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
              rows={5}
            />
            <div className="bc-char-count">{message.length} / 500</div>
          </div>

          <div className="bc-divider" />

          <div className="bc-field">
            <label className="bc-field-label">Attachments</label>
            <button className="bc-attach-btn" onClick={() => fileInputRef.current?.click()}>
              <PaperclipIcon />
              <span>Add Attachment</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {files.length > 0 && (
              <div className="bc-attach-list">
                {files.map((file, i) => (
                  <div key={i} className="bc-attach-item">
                    <FileIcon />
                    <span className="bc-attach-item__name">{file.name}</span>
                    <button className="bc-attach-item__remove" onClick={() => removeFile(i)} aria-label="Remove">
                      <XIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Schedule date/time */}
        {scheduled && (
          <div className="bc-card">
            <div className="bc-card__title">Schedule Date & Time</div>
            <div className="bc-date-row">
              <input
                type="date"
                className="bc-date-input"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
              />
              <input
                type="time"
                className="bc-date-input"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bc-actions bc-actions--stacked">
          <button
            className={`bc-btn bc-btn--send${!canSend ? ' bc-btn--disabled' : ''}`}
            onClick={() => { if (canSend) setSent(true) }}
          >
            <SendIcon />
            Send Now
          </button>
          <button
            className={`bc-btn bc-btn--schedule${scheduled ? ' bc-btn--schedule-on' : ''}`}
            onClick={() => {
              if (scheduled && scheduleDate) {
                setSent(true)
              } else {
                setScheduled(s => !s)
              }
            }}
          >
            <CalendarIcon />
            {scheduled ? (scheduleDate ? 'Confirm Schedule' : 'Remove Schedule') : 'Schedule'}
          </button>
        </div>

      </div>
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────── */
function AudienceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}

function ChevronRightIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--lime)' : 'var(--text-muted)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-dark)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
