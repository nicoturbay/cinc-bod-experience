import { useState } from 'react'
import './WelcomeModal.css'

const CEPHAI_LOGO = '/images/cephai-logo.svg'

function PulseIcon() {
  return (
    <svg width="30" height="27" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.3369 0C23.8043 0 24.9999 1.19452 25 2.66113V15.7949C25 17.2616 23.8044 18.4561 22.3369 18.4561H13.3301V20.3408H18.8184C19.2764 20.3409 19.6484 20.713 19.6484 21.1709C19.6482 21.6286 19.2763 21.9999 18.8184 22H6.17871C5.72069 22 5.34884 21.6286 5.34863 21.1709C5.34863 20.713 5.72056 20.3408 6.17871 20.3408H11.6699V18.4561H2.66309C1.19564 18.4561 2.7923e-05 17.2616 0 15.7949V2.66113C6.43438e-05 1.19452 1.19566 0 2.66309 0H22.3369ZM2.66309 1.65625C2.10864 1.65625 1.66016 2.10737 1.66016 2.6582V15.792C1.6604 16.3459 2.1121 16.7939 2.66309 16.7939H22.3369C22.8912 16.7939 23.3396 16.3426 23.3398 15.792V2.6582C23.3398 2.10405 22.888 1.65625 22.3369 1.65625H2.66309ZM9.01074 6.62695C9.33611 6.30176 9.86116 6.30176 10.1865 6.62695L13.9609 10.3994L15.5684 8.79297C15.7243 8.63734 15.9331 8.55085 16.1553 8.55078H19.9043C20.3623 8.55099 20.7344 8.92307 20.7344 9.38086C20.7343 9.83858 20.3622 10.2098 19.9043 10.21H16.501L14.5518 12.1611C14.3958 12.317 14.1871 12.4032 13.9648 12.4033L13.9609 12.4004C13.7418 12.4004 13.5291 12.3141 13.373 12.1582L9.59863 8.38477L8.12793 9.85547C7.97189 10.0114 7.76246 10.0977 7.54004 10.0977H5.09668C4.63851 10.0977 4.2666 9.7255 4.2666 9.26758C4.26674 8.80978 4.6386 8.43848 5.09668 8.43848H7.19824L9.01074 6.62695Z" fill="currentColor"/>
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
        <h1 className="welcome-modal__title">WELCOME TO<br />THE BOARD EXPERIENCE</h1>
        <p className="welcome-modal__subtitle">
          No more waiting for the monthly packet.<br />
          Everything your board needs to know, and act on<br />
          is live, in your pocket, right now.
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
              <span>Ask anything about your community. CephAI reads every screen and answers in plain language.</span>
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
