import { useState, useEffect } from 'react'
import './ReportViolation.css'

const VIOLATION_IMAGE = '/images/violation.png'

const ADDRESSES = [
  '12 Cardinal Hills Dr',
  '45 Oak Lane',
  '88 Oak Ln',
  '102 Maple Court',
  '204 Maple Drive',
  '316 Birchwood Blvd',
  '421 Pine Ridge Rd',
  '507 Elm Street',
  '614 Cedar Way',
  '728 Willow Creek Ln',
  '815 Sycamore Ave',
  '933 Laurel Hill Rd',
  '1048 Rosewood Dr',
  '1156 Ivy Gate Ct',
  '1212 Thornberry Ln',
]

const CEPHAI_LINES = [
  'Analyzing uploaded photo…',
  'Detecting vegetation overgrowth patterns…',
  'Cross-referencing CC&R Section 7.2 — Lawn & Landscaping Standards…',
  'Violation identified: Overgrown lawn exceeds 6" maximum height threshold.',
  'Generating violation notice draft…',
  'Documentation complete. Ready for submission.',
]

// step 0 = form (photo + description + location)
// step 1 = CephAI analysis
// step 2 = confirmed

export default function ReportViolation({ onClose }) {
  const [step, setStep] = useState(0)

  const [photoReady, setPhotoReady] = useState(false)
  const [description, setDescription] = useState('')
  const [useGeo, setUseGeo] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoSet, setGeoSet] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [aiLines, setAiLines] = useState([])
  const [aiDone, setAiDone] = useState(false)

  /* ── AI analysis simulation ── */
  useEffect(() => {
    if (step !== 1) return
    setAiLines([])
    setAiDone(false)
    let i = 0
    const tick = () => {
      if (i >= CEPHAI_LINES.length) { setAiDone(true); return }
      setAiLines(prev => [...prev, CEPHAI_LINES[i]])
      i++
      setTimeout(tick, i === CEPHAI_LINES.length ? 400 : 900)
    }
    setTimeout(tick, 400)
  }, [step])

  /* ── Geo simulation ── */
  function handleGeo() {
    setGeoLoading(true)
    setTimeout(() => {
      setGeoLoading(false)
      setGeoSet(true)
      setUseGeo(true)
      setSelectedAddress('12 Cardinal Hills Dr')
      setAddressQuery('12 Cardinal Hills Dr')
    }, 1800)
  }

  const suggestions = addressQuery.length > 1
    ? ADDRESSES.filter(a => a.toLowerCase().includes(addressQuery.toLowerCase())).slice(0, 5)
    : []

  const locationReady = geoSet || selectedAddress.length > 0
  const formReady = photoReady && locationReady

  const analysisBack = step === 1
  const isConfirmed = step === 2

  return (
    <div className="rv-panel">

      {/* ── Header ── */}
      {!isConfirmed && (
        <>
          <div className="rv-header">
            <button
              className="app-header__back"
              onClick={step === 0 ? onClose : undefined}
              aria-label="Back"
              style={analysisBack ? { opacity: 0, pointerEvents: 'none' } : undefined}
            >
              <ChevronLeftIcon />
            </button>
            <div className="app-header__hoa">
              <span className="rv-page-title">
                {step === 1 ? 'CephAI Analysis' : ''}
              </span>
            </div>
          </div>
          <div className="app-header__divider" />
        </>
      )}

      {/* ── Step 0: Combined form ── */}
      {step === 0 && (
        <div className="rv-body">

          <h2 className="rv-form-title">Report Violation</h2>

          {/* Photo */}
          <p className="rv-section-label">Photo</p>
          <div
            className={`rv-photo-zone${photoReady ? ' rv-photo-zone--loaded' : ''}`}
            onClick={() => setPhotoReady(true)}
          >
            {photoReady ? (
              <img src={VIOLATION_IMAGE} alt="Violation" className="rv-photo-preview" />
            ) : (
              <>
                <CameraIcon />
                <span className="rv-photo-zone__label">Tap to add photo</span>
                <span className="rv-photo-zone__sub">Camera or library</span>
              </>
            )}
          </div>
          {photoReady && (
            <button className="rv-photo-retake" onClick={() => setPhotoReady(false)}>
              <RetakeIcon /> Retake
            </button>
          )}

          {/* Description */}
          <p className="rv-section-label" style={{ marginTop: 6 }}>Description</p>
          <textarea
            className="rv-textarea"
            placeholder="e.g. Lawn is severely overgrown, exceeding allowed height…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
          />
          <p className="rv-char-count">{description.length} / 300</p>

          {/* Location */}
          <p className="rv-section-label">Location</p>
          <button
            className={`rv-geo-btn${geoSet ? ' rv-geo-btn--active' : ''}${geoLoading ? ' rv-geo-btn--loading' : ''}`}
            onClick={handleGeo}
            disabled={geoLoading || geoSet}
          >
            <LocationIcon />
            {geoLoading ? 'Locating…' : geoSet ? 'Location detected' : 'Use my current location'}
          </button>

          <div className="rv-or"><span>or type an address</span></div>

          <div className="rv-address-wrap">
            <input
              className="rv-address-input"
              type="text"
              placeholder="Start typing an address…"
              value={addressQuery}
              onChange={e => {
                setAddressQuery(e.target.value)
                setSelectedAddress('')
                setUseGeo(false)
                setGeoSet(false)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="rv-suggestions">
                {suggestions.map(s => (
                  <button
                    key={s}
                    className="rv-suggestion"
                    onClick={() => {
                      setSelectedAddress(s)
                      setAddressQuery(s)
                      setShowSuggestions(false)
                    }}
                  >
                    <LocationIcon size={14} />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 1: AI Analysis ── */}
      {step === 1 && (
        <div className="rv-body rv-body--analysis">
          <div className="rv-analysis-photo-wrap">
            <img src={VIOLATION_IMAGE} alt="Violation" className="rv-analysis-photo" />
            <div className="rv-analysis-scan" />
          </div>

          <div className="rv-ai-lines">
            <div className="rv-ai-header">
              <CephaiLogoIcon />
              <span>CephAI is analyzing your report</span>
            </div>
            {aiLines.map((line, i) => (
              <div key={i} className={`rv-ai-line${i === aiLines.length - 1 && !aiDone ? ' rv-ai-line--typing' : ''}`}>
                {i === CEPHAI_LINES.length - 1 ? <CheckCircleIcon /> : <AiDotIcon />}
                <span>{line}</span>
              </div>
            ))}
          </div>

          {aiDone && (
            <div className="rv-ai-result">
              <p className="rv-ai-result__label">CC&amp;R Reference</p>
              <p className="rv-ai-result__value">Section 7.2 — Lawn &amp; Landscaping Standards</p>
              <p className="rv-ai-result__label" style={{ marginTop: 10 }}>Violation Type</p>
              <p className="rv-ai-result__value">Overgrown Lawn — Height exceeds 6&quot; maximum</p>
              <p className="rv-ai-result__label" style={{ marginTop: 10 }}>Address</p>
              <p className="rv-ai-result__value">{selectedAddress || '12 Cardinal Hills Dr'}</p>
              <p className="rv-ai-result__label" style={{ marginTop: 10 }}>Status</p>
              <p className="rv-ai-result__value" style={{ color: '#ffb74d' }}>Pending Board Review</p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Confirmed ── */}
      {step === 2 && (
        <div className="rv-body rv-body--confirmed">
          <div className="rv-confirmed-icon">
            <BigCheckIcon />
          </div>
          <h2 className="rv-confirmed-title">Violation Reported</h2>
          <p className="rv-confirmed-sub">
            CephAI has documented this violation and submitted it for board review. A notice will be issued to the homeowner within 3 business days.
          </p>
          <div className="rv-confirmed-card">
            <img src={VIOLATION_IMAGE} alt="Violation" className="rv-confirmed-photo" />
            <div className="rv-confirmed-detail">
              <p className="rv-confirmed-detail__type">Overgrown Lawn</p>
              <p className="rv-confirmed-detail__addr">{selectedAddress || '12 Cardinal Hills Dr'}</p>
              <p className="rv-confirmed-detail__ref">CC&amp;R § 7.2</p>
            </div>
          </div>
          <button className="rv-done-btn" onClick={onClose}>Done</button>
        </div>
      )}

      {/* ── Footer ── */}
      {step === 0 && (
        <div className="rv-footer">
          <button
            className="rv-next-btn"
            disabled={!formReady}
            onClick={() => setStep(1)}
          >
            Next
          </button>
        </div>
      )}
      {step === 1 && aiDone && (
        <div className="rv-footer">
          <button className="rv-next-btn rv-next-btn--active" onClick={() => setStep(2)}>
            Submit Violation
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Icons ── */
function ChevronLeftIcon() {
  return (
    <svg width="43" height="43" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function CameraIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
function RetakeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  )
}
function LocationIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function CephaiLogoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#B2DE61" />
      <path d="M20 8l8 6v12l-8 6-8-6V14l8-6z" fill="#112719" />
      <circle cx="20" cy="20" r="4" fill="#B2DE61" />
    </svg>
  )
}
function AiDotIcon() {
  return <span className="rv-ai-dot" />
}
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6bcb77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
    </svg>
  )
}
function BigCheckIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#6bcb77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
    </svg>
  )
}
