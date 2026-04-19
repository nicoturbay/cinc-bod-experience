import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useMode } from '../ModeContext'
import './CephAIChat.css'

/* ── Per-card analysis ────────────────────────────────── */
function getTaskCardContext(task) {
  if (!task) return null

  if (task.type === 'Invoice') {
    const analysis = task.urgency === 'urgent'
      ? `This invoice is due today and is consistent with prior submissions from this vendor. Delaying risks late-payment penalties.`
      : `This invoice is in line with previous invoices submitted by the same vendor and is aligned with the contract available in the document repository.`
    const action = task.urgency === 'urgent'
      ? '**Approve** — tap Approve to confirm before end of day.'
      : '**Approve** — tap Approve to confirm, or Deny if anything looks off.'
    const confidence = task.urgency === 'urgent' ? 91 : 94
    return {
      badge: `Invoice — ${task.title}`,
      greeting: `${analysis}\n\n**Recommendation[${confidence}]: ${action}**`,
      suggestions: ['Vendor history', 'Budget impact', 'Draft approval note', 'Flag for review'],
    }
  }

  if (task.type === 'ACC') {
    const DECISION_MAP = {
      'Solar Panel Installation': { decision: 'Approve with stipulations', note: 'panels must face rear or non-street-facing elevations per CC&R §4.2' },
      'Deck Installation':        { decision: 'Approve', note: 'request falls within standard size and material guidelines' },
    }
    const decisionRec = DECISION_MAP[task.accType] ?? { decision: 'Approve', note: 'request appears to meet CC&R requirements' }
    const analysis = task.autoApprovalUrgent
      ? `The auto-approval window has passed (${task.autoApproval}). No decision has been issued, creating deemed-approval risk under state law.`
      : `This request is within CC&R guidelines and the committee has it under review. The auto-approval deadline is ${task.autoApproval}.`
    const action = task.autoApprovalUrgent
      ? `**Add Decision** — select **${decisionRec.decision}** (${decisionRec.note}). Act immediately to close the deemed-approval risk.`
      : `**Add Decision** — select **${decisionRec.decision}** (${decisionRec.note}), or Add Comment to request more information from the committee.`
    const confidence = task.autoApprovalUrgent ? 97 : 87
    return {
      badge: `ACC — ${task.address}`,
      greeting: `${analysis}\n\n**Recommendation[${confidence}]: ${action}**`,
      suggestions: ['CC&R requirements', 'Similar past requests', 'Draft approval letter', 'Draft denial letter'],
    }
  }

  if (task.type === 'Violation') {
    const analysis = `Owner has not responded to prior notices. This is at the 3rd notice stage and fines begin ${task.fineStarts}. Hearing date and notice delivery need to be confirmed.`
    const action = `**Add Board Note** — document the board's decision to escalate. Use Add Comment to log any follow-up communication with the owner.`
    return {
      badge: `Violation — ${task.address}`,
      greeting: `${analysis}\n\n**Recommendation[92]: ${action}**`,
      suggestions: ['Fine enforcement rules', 'Draft board note', 'Escalation steps', 'Owner contact history'],
    }
  }

  if (task.type === 'WorkOrder') {
    const analysis = task.urgency === 'urgent'
      ? `This work order is due today. No confirmation of receipt has been logged from ${task.vendor}.`
      : `Work scope and cost for WO ${task.woNumber} align with the approved budget line. No issues flagged in the vendor or on-site logs.`
    const action = task.urgency === 'urgent'
      ? `**Add Note** — log your follow-up with ${task.vendor} and expected completion date.`
      : `**Add Note** — log board sign-off to close this work order.`
    const confidence = task.urgency === 'urgent' ? 95 : 89
    return {
      badge: `Work Order ${task.woNumber}`,
      greeting: `${analysis}\n\n**Recommendation[${confidence}]: ${action}**`,
      suggestions: ['Vendor history', 'Budget line check', 'Related work orders', 'Draft status note'],
    }
  }

  return null
}

const CEPHAI_LOGO = '/images/cephai-logo.svg'

/* ── Screen contexts ──────────────────────────────────── */
const SCREEN_CONTEXTS = {
  '/pulse': {
    badge: 'Analyzing Community Pulse',
    greeting: "I've reviewed the **April 2026** data. A few things stand out:\n\n• Maintenance is on pace for **$127K** — $55K over annual budget\n• Landscaping is at risk of exceeding the $144K annual budget\n• 42 open violations, up 12 this month\n• Total delinquency jumped $19,400 from last month\n\nWhat would you like to dig into?",
    suggestions: ['Explain budget overruns', 'Violations analysis', 'Delinquency risks', 'Compare to March'],
  },
  '/tasks': {
    badge: 'Analyzing Task Queue',
    greeting: "I can see your board task queue. I can help you prioritize, find supporting documentation, or help you make faster decisions. What do you need?",
    suggestions: ['What needs urgent action?', 'Summarize pending approvals', 'Help me draft a response'],
  },
}

const DEFAULT_CONTEXT = {
  badge: null,
  greeting: "Hi, I'm CephAI — your HOA intelligence assistant. Ask me about Cardinal Hills HOA rules, financials, board responsibilities, or anything you see on screen.",
  suggestions: ['HOA rules summary', 'Board member duties', 'Community policies', 'Upcoming meetings'],
}

/* ── Simulated AI responses ───────────────────────────── */
function getAIResponse(message, pathname) {
  const m = message.toLowerCase()

  if (pathname === '/pulse') {
    if (m.includes('maintenance') || (m.includes('budget') && m.includes('over'))) {
      return "Maintenance has been **chronically over budget** all year. In April, actual spend was $10,590 against a $6,000 monthly budget — projecting $127K annually against a $72K annual budget. That's a **76% overrun**.\n\nI'd recommend the board request an itemized breakdown from management and ask whether prior-year deferred repairs are being front-loaded into this fiscal year."
    }
    if (m.includes('violation')) {
      return "Violations are up 12 this month to 42 open cases. Landscaping (18) leads — typical for spring. Home exterior violations (11) tend to persist longer without direct owner outreach.\n\nThe spike looks like seasonal spring inspection backlog, not a sudden surge. That said, the 12-unit increase is higher than the March-to-April average historically."
    }
    if (m.includes('delinquency') || m.includes('delinquent') || m.includes('lien')) {
      return "Total delinquency is $84,210 — up $19,400 from last month. Three accounts are at lien status: 735 E Sierra Madre, 420 E Newcomer, and 854 E Weeping Willow.\n\nThe jump is partly seasonal (post-holiday payment lag) and partly two new lien escalations. I'd suggest confirming the attorney has received the lien packets for the two new escalations before the next board meeting."
    }
    if (m.includes('landscaping') || m.includes('at risk')) {
      return "Landscaping is projecting $146,400 annually against a $144,000 budget — just over the at-risk threshold. This is often seasonal: Q1 and Q2 run higher due to spring cleanup contracts and tend to normalize in Q3.\n\nUnless the board approved additional scope this year, this is worth monitoring but unlikely to blow out without an unusual event."
    }
    if (m.includes('compare') || m.includes('march') || m.includes('last month')) {
      return "April vs March 2026:\n\n• **Violations** 42 vs 30 — up 12 (spring surge, normal)\n• **Delinquency** $84K vs $64.8K — up $19.4K (two new liens)\n• **Maintenance overrun** deepened: April +$4,590 vs March +$3,140 over budget\n• **Budget variance** worsened: -$3,180 vs -$1,440\n\nAcross the board April escalated — mostly seasonal, but Maintenance is a structural issue that needs the board's attention."
    }
  }

  if (pathname === '/tasks') {
    if (m.includes('urgent') || m.includes('priority') || m.includes('action')) {
      return "Your highest-priority items right now:\n\n1. **Invoice approvals** — 5 pending, $18,340 total\n2. **ACC requests** — 3 past the 30-day response window (legal exposure)\n3. **Violation hearing votes** — Scheduled for next week, board decisions needed\n\nThe ACC timing is the most legally sensitive. Want help drafting any of these responses?"
    }
  }

  if (m.includes('rule') || m.includes('regulation') || m.includes("cc&r")) {
    return "Cardinal Hills HOA is governed by the CC&Rs recorded in 2018, with amendments in 2021 and 2023. Key areas include architectural guidelines, landscaping standards, parking rules, and noise ordinances.\n\nWhat specific rule or topic are you looking for?"
  }
  if (m.includes('board') || m.includes('duty') || m.includes('role') || m.includes('responsib')) {
    return "As a Cardinal Hills board member your core responsibilities are:\n\n• **Fiduciary duty** — act in the financial interest of the association\n• Approve annual budgets and reserve studies\n• Enforce CC&Rs and bylaws consistently\n• Approve or deny architectural change requests\n• Attend and vote at monthly board meetings\n\nIs there a specific area you'd like guidance on?"
  }
  if (m.includes('meeting') || m.includes('agenda') || m.includes('schedule')) {
    return "The next board meeting is scheduled for **May 14, 2026 at 5:30 PM** via Zoom. The agenda includes: reserve study update, Q1 financial review, 3 ACC appeals, and the Maintenance contractor contract renewal.\n\nWant me to summarize any of the agenda items?"
  }

  return `I heard "${message}" — let me check what I know about Cardinal Hills HOA.\n\nCould you be a bit more specific? I can cover financials, violations, delinquencies, CC&R rules, board procedures, or anything currently on your screen.`
}

/* ── Markdown-lite renderer ───────────────────────────── */
function renderText(text, onAction) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Recommendation box (with optional confidence score)
    const recMatch = line.match(/^\*\*Recommendation\[(\d+)\]:\s*(.*?)\*\*$/)
    if (recMatch) {
      const confidence = parseInt(recMatch[1])
      const action = recMatch[2]
      const barColor = confidence >= 85 ? '#b2de61' : confidence >= 65 ? '#f5a623' : '#e05252'
      const actionParts = action.split(/\*\*(.*?)\*\*/g).map((p, j) =>
        j % 2 === 1 ? <strong key={j}>{p}</strong> : p
      )
      // Extract first **bold** segment as the button label
      const btnLabel = (action.match(/^\*\*([^*]+)\*\*/) ?? [])[1] ?? 'Take Action'
      return (
        <div key={i} className="cephai-rec-box">
          <div className="cephai-rec-header">
            <span className="cephai-rec-label">Recommendation</span>
            <span className="cephai-rec-score" style={{ color: barColor }}>{confidence}% confidence</span>
          </div>
          <div className="cephai-rec-bar-track">
            <div className="cephai-rec-bar-fill" style={{ width: `${confidence}%`, background: barColor }} />
          </div>
          <span className="cephai-rec-action">{actionParts}</span>
          {onAction && (
            <button className="cephai-rec-btn" onClick={onAction}>
              {btnLabel} →
            </button>
          )}
        </div>
      )
    }
    const parts = line.split(/\*\*(.*?)\*\*/g)
    const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
    if (line.startsWith('• ')) {
      return <li key={i}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p.replace(/^• /, ''))}</li>
    }
    if (line.match(/^\d+\. /)) {
      return <li key={i}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p.replace(/^\d+\. /, ''))}</li>
    }
    if (line === '') return <br key={i} />
    return <p key={i}>{rendered}</p>
  })
}

/* ── Component ────────────────────────────────────────── */
export default function CephAIChat() {
  const { chatOpen, setChatOpen, activeTask } = useMode()
  const { pathname } = useLocation()
  const messagesEndRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  // Resolve context: card-specific on /tasks, else screen-level
  function getCtx() {
    if (pathname === '/tasks' && activeTask) {
      const cardCtx = getTaskCardContext(activeTask)
      if (cardCtx) return cardCtx
    }
    return SCREEN_CONTEXTS[pathname] ?? DEFAULT_CONTEXT
  }

  // Reset and seed greeting each time panel opens
  useEffect(() => {
    if (chatOpen) {
      const ctx = getCtx()
      setMessages([{ role: 'ai', text: ctx.greeting }])
      setSuggestions(ctx.suggestions)
      setInput('')
      setThinking(false)
    }
  }, [chatOpen, pathname, activeTask?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function handleSend(text) {
    const msg = (text ?? input).trim()
    if (!msg || thinking) return
    setSuggestions([])
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      const response = getAIResponse(msg, pathname)
      setMessages(prev => [...prev, { role: 'ai', text: response }])
      setThinking(false)
    }, 900 + Math.random() * 600)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`cephai-overlay${chatOpen ? ' cephai-overlay--open' : ''}`}
        onClick={() => setChatOpen(false)}
      />

      {/* Panel */}
      <div className={`cephai-panel${chatOpen ? ' cephai-panel--open' : ''}`}>

        {/* Handle */}
        <div className="cephai-panel__handle-wrap">
          <div className="cephai-panel__handle" />
        </div>

        {/* Header */}
        <div className="cephai-panel__header">
          <div className="cephai-panel__brand">
            <img src={CEPHAI_LOGO} alt="CephAI" className="cephai-panel__logo" />
            <div className="cephai-panel__brand-text">
              <span className="cephai-panel__name">CephAI</span>
              {getCtx().badge && <span className="cephai-panel__badge">{getCtx().badge}</span>}
            </div>
          </div>
          <button className="cephai-panel__close" onClick={() => setChatOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div className="cephai-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`cephai-bubble cephai-bubble--${msg.role}`}>
              {msg.role === 'ai' && (
                <img src={CEPHAI_LOGO} alt="" className="cephai-bubble__avatar" />
              )}
              <div className="cephai-bubble__body">
                {msg.role === 'ai'
                  ? <div className="cephai-bubble__text">{renderText(msg.text, msg.role === 'ai' && pathname === '/tasks' ? () => setChatOpen(false) : null)}</div>
                  : <div className="cephai-bubble__text">{msg.text}</div>
                }
              </div>
            </div>
          ))}

          {thinking && (
            <div className="cephai-bubble cephai-bubble--ai">
              <img src={CEPHAI_LOGO} alt="" className="cephai-bubble__avatar" />
              <div className="cephai-bubble__body">
                <div className="cephai-thinking">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {suggestions.length > 0 && (
          <div className="cephai-suggestions">
            {suggestions.map(s => (
              <button key={s} className="cephai-chip" onClick={() => handleSend(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="cephai-input-row">
          <input
            className="cephai-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask CephAI anything…"
          />
          <button
            className={`cephai-send${input.trim() ? ' cephai-send--active' : ''}`}
            onClick={() => handleSend()}
          >
            <SendIcon />
          </button>
        </div>

      </div>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  )
}
