import { useState } from 'react'
import './WelcomeModal.css'

const CEPHAI_LOGO = '/images/cephai-logo.svg'

function HoldIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 12V5a2 2 0 0 1 4 0v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 12V3a2 2 0 0 1 4 0v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 12V6a2 2 0 0 1 4 0v8c0 4.418-3.582 8-8 8a8 8 0 0 1-8-8v-3a2 2 0 0 1 4 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="5" r="1" fill="currentColor" opacity="0.4"/>
    </svg>
  )
}

function InsightIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.2V17a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1.8A7 7 0 0 1 12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21h6M10 18v3M14 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9.5 11l1.5 1.5L15 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function LiveIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 77.42 65.9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M74.42,29.95h-18.73c-1.33,0-2.51.88-2.88,2.16l-5.81,19.9L33.01,2.19c-.36-1.29-1.54-2.19-2.89-2.19h0c-1.35,0-2.53.9-2.88,2.2l-7.46,27.03H3c-1.66,0-3,1.34-3,3s1.34,3,3,3h19.06c1.35,0,2.53-.9,2.89-2.2l5.2-18.84,13.9,49.52c.36,1.29,1.53,2.18,2.87,2.19h.02c1.33,0,2.51-.88,2.88-2.16l8.12-27.79h16.48c1.66,0,3-1.34,3-3s-1.34-3-3-3Z" fill="currentColor"/>
    </svg>
  )
}

export default function PulseTourModal({ onClose }) {
  const [dontShow, setDontShow] = useState(false)

  function handleDone() {
    if (dontShow) {
      localStorage.setItem('pulseTourDismissed', 'true')
    }
    onClose()
  }

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <h1 className="welcome-modal__title">COMMUNITY<br />PULSE</h1>
        <p className="welcome-modal__subtitle">
          Your community's vital signs, live, in one place. Here's how to get the most out of it.
        </p>

        <div className="welcome-modal__features">
          <div className="welcome-modal__feature">
            <span className="welcome-modal__feature-icon">
              <HoldIcon />
            </span>
            <div className="welcome-modal__feature-text">
              <strong>Hold any card for AI analysis</strong>
              <span>Press and hold any data card for 2 seconds. Cephai will surface deep insights and context specific to that metric.</span>
            </div>
          </div>

          <div className="welcome-modal__feature">
            <span className="welcome-modal__feature-icon">
              <img src={CEPHAI_LOGO} alt="Cephai" className="welcome-modal__cephai-logo" style={{ width: 28, height: 28 }} />
            </span>
            <div className="welcome-modal__feature-text">
              <strong>Context-aware answers</strong>
              <span>Cephai reads what's on screen and delivers answers about violations, finances, delinquency, and trends. No prompting needed.</span>
            </div>
          </div>

          <div className="welcome-modal__feature">
            <span className="welcome-modal__feature-icon">
              <LiveIcon />
            </span>
            <div className="welcome-modal__feature-text">
              <strong>Always live data</strong>
              <span>Every number updates in real time. What you see reflects what's happening in your community right now.</span>
            </div>
          </div>
        </div>

        <button className="welcome-modal__cta" onClick={handleDone}>
          GOT IT
        </button>

        <label className="welcome-modal__dont-show">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={e => setDontShow(e.target.checked)}
          />
          <span>Don't show this again</span>
        </label>
      </div>
    </div>
  )
}
