import { useState } from 'react'
import './WelcomeModal.css'

const CEPHAI_LOGO = '/images/cephai-logo.svg'

function PulseIcon() {
  return (
    <svg width="30" height="27" viewBox="0 0 77.42 65.9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M74.42,29.95h-18.73c-1.33,0-2.51.88-2.88,2.16l-5.81,19.9L33.01,2.19c-.36-1.29-1.54-2.19-2.89-2.19h0c-1.35,0-2.53.9-2.88,2.2l-7.46,27.03H3c-1.66,0-3,1.34-3,3s1.34,3,3,3h19.06c1.35,0,2.53-.9,2.89-2.2l5.2-18.84,13.9,49.52c.36,1.29,1.53,2.18,2.87,2.19h.02c1.33,0,2.51-.88,2.88-2.16l8.12-27.79h16.48c1.66,0,3-1.34,3-3s-1.34-3-3-3Z" fill="currentColor"/>
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28.8057 27.6338C29.4649 27.6339 30.0001 28.1644 30.0001 28.8174C29.9998 29.4701 29.4647 29.9999 28.8057 30H1.19733C0.538201 30 0.00323075 29.4702 0.00298994 28.8174C0.00298994 28.1643 0.538053 27.6338 1.19733 27.6338H28.8057ZM12.3858 11.8144C12.854 11.3507 13.6081 11.3507 14.0762 11.8144C14.5444 12.2782 14.5444 13.0255 14.0762 13.4892L6.05572 21.4346C5.83123 21.6569 5.53004 21.7802 5.21002 21.7803L5.20514 21.7754C4.88983 21.7754 4.58397 21.6521 4.35944 21.4297L0.351623 17.46C-0.116557 16.9962 -0.116557 16.2479 0.351623 15.7842C0.81971 15.3208 1.57395 15.3208 2.04205 15.7842L5.21002 18.9219L12.3858 11.8144ZM28.8057 16.1631C29.4647 16.1633 29.9999 16.6929 30.0001 17.3457C30.0001 17.9986 29.4648 18.5291 28.8057 18.5293H18.2042C17.545 18.5291 17.0098 17.9987 17.0098 17.3457C17.01 16.6929 17.5451 16.1632 18.2042 16.1631H28.8057ZM12.3858 0.347646C12.8539 -0.115738 13.6081 -0.1157 14.0762 0.347646C14.5444 0.811405 14.5444 1.55967 14.0762 2.02343L6.05572 9.96874C5.8312 10.1911 5.53008 10.3144 5.21002 10.3144L5.20514 10.3096C4.88985 10.3095 4.58396 10.1863 4.35944 9.96386L0.351623 5.99315C-0.116557 5.5294 -0.116557 4.78211 0.351623 4.31835C0.819803 3.85461 1.57486 3.8546 2.04303 4.31835L5.21002 7.45604L12.3858 0.347646ZM28.8057 4.69237C29.4648 4.69259 30 5.22212 30.0001 5.87499C30.0001 6.5279 29.4648 7.05836 28.8057 7.05858H18.2042C17.545 7.05844 17.0098 6.52795 17.0098 5.87499C17.0099 5.22208 17.545 4.69252 18.2042 4.69237H28.8057Z" fill="currentColor"/>
    </svg>
  )
}

export default function WelcomeModal({ onClose }) {
  const [dontShow, setDontShow] = useState(false)

  function handleStart() {
    if (dontShow) {
      localStorage.setItem('boardWelcomeDismissed', 'true')
    }
    onClose()
  }

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <h1 className="welcome-modal__title">WELCOME TO<br />YOUR BOARD EXPERIENCE</h1>
        <p className="welcome-modal__subtitle">
          No more waiting for the monthly packet. Everything your board needs to know, and act on is live, in your pocket, right now.
        </p>

        <div className="welcome-modal__features">
          <div className="welcome-modal__feature">
            <span className="welcome-modal__feature-icon welcome-modal__feature-icon--check">
              <PulseIcon />
            </span>
            <div className="welcome-modal__feature-text">
              <strong>Live community pulse</strong>
              <span>Real-time violations, financials, and delinquency — updated continuously, not once a month.</span>
            </div>
          </div>

          <div className="welcome-modal__feature">
            <span className="welcome-modal__feature-icon welcome-modal__feature-icon--check">
              <TasksIcon />
            </span>
            <div className="welcome-modal__feature-text">
              <strong>Decide in seconds</strong>
              <span>Violations. Collections approvals, presented as clear action cards with all the context you need.</span>
            </div>
          </div>

          <div className="welcome-modal__feature">
            <span className="welcome-modal__feature-icon">
              <img src={CEPHAI_LOGO} alt="CephAI" className="welcome-modal__cephai-logo" />
            </span>
            <div className="welcome-modal__feature-text">
              <strong>AI companion</strong>
              <span>Ask CephAi anything about your community. When it's pulsating, CephAi is actively analyzing and ready to provide insights and answers based on what's on your screen.</span>
            </div>
          </div>
        </div>

        <button className="welcome-modal__cta" onClick={handleStart}>
          GET STARTED
        </button>

        <label className="welcome-modal__dont-show">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={e => setDontShow(e.target.checked)}
          />
          <span>Don't show this message again</span>
        </label>
      </div>
    </div>
  )
}
