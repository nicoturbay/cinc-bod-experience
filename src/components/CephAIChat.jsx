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
  '/meeting': {
    badge: "Analyzing Tonight's Agenda",
    greeting: "Tonight's meeting has **8 agenda items** across the General and Executive sessions. The most action-intensive items are:\n\n• **Consent calendar** — board vote on Minutes, Financials, Delinquency, and Investment reports\n• **Violation hearings** — 9 cases including Tang, Chen, Ahluwalia + 6 more require individual board decisions\n• **Delinquency decisions** — 4 accounts at lien & foreclosure stage require board authorization\n\nWant me to brief you on any specific item?",
    suggestions: ['Explain consent calendar', 'Violation hearings detail', 'Delinquency decisions', 'How to vote tonight'],
  },
  '/broadcast': {
    badge: 'Message Crafting Assistant',
    greeting: "I can help you write a clear, effective broadcast message for your community. What do you want to communicate?",
    suggestions: ['Draft a pool closure notice', 'Write a parking rule reminder', 'Draft a maintenance alert', 'Emergency notice template'],
  },
}

const DEFAULT_CONTEXT = {
  badge: null,
  greeting: "Hi, I'm CephAI — your HOA intelligence assistant. Ask me about Cardinal Hills HOA rules, financials, board responsibilities, or anything you see on screen.",
  suggestions: ['HOA rules summary', 'Board member duties', 'Community policies', 'Upcoming meetings'],
}

/* ── Simulated AI responses ───────────────────────────── */
function getAIResponse(message, pathname, task) {
  const m = message.toLowerCase()

  /* ── Pulse responses ──────────────────────────────── */
  if (pathname === '/pulse') {
    if (m.includes('maintenance') || m.includes('explain budget') || (m.includes('budget') && m.includes('over'))) {
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

  /* ── Tasks queue responses ────────────────────────── */
  if (pathname === '/tasks' && !task) {
    if (m.includes('urgent') || m.includes('priority') || m.includes('action')) {
      return "Your highest-priority items right now:\n\n1. **Invoice approvals** — 5 pending, $18,340 total\n2. **ACC requests** — 3 past the 30-day response window (legal exposure)\n3. **Violation hearing votes** — Scheduled for next week, board decisions needed\n\nThe ACC timing is the most legally sensitive. Want help drafting any of these responses?"
    }
    if (m.includes('summarize') || m.includes('pending approval')) {
      return "Pending approvals across your queue:\n\n• **5 invoices** totaling $18,340 — oldest is 12 days pending\n• **3 ACC requests** — two are within the 30-day window, one has passed it\n• **2 work orders** awaiting sign-off — both vendors have acknowledged\n\nTotal financial exposure if delayed: $18,340 in invoices + 1 deemed-approval risk on the ACC."
    }
    if (m.includes('draft') || m.includes('response')) {
      return "I can help draft responses for any open item. Which would you like?\n\n• **Invoice approval** — formal approval or denial note\n• **ACC decision** — approval with stipulations or denial letter\n• **Violation board note** — escalation authorization\n• **Work order status** — vendor follow-up or sign-off note\n\nJust swipe to the card and open me again — I'll have a draft ready."
    }
  }

  /* ── Invoice card responses ───────────────────────── */
  if (task?.type === 'Invoice') {
    if (m.includes('vendor history')) {
      return `**${task.title}** has been an active vendor with Cardinal Hills HOA since 2021.\n\n• 18 invoices processed — zero disputed\n• Average invoice: $5,840 | This invoice: **${task.amount}** — within normal range\n• Last 3 invoices approved without modification\n• No open work order disputes or complaints on file\n\nVendor performance is consistent and reliable.`
    }
    if (m.includes('budget impact')) {
      return `GL ${task.glAccount} (${task.glDescription}):\n\n• **April budget:** $12,000 | **Actual to date:** $12,200\n• This invoice would bring April to $18,400 — **$6,400 over monthly budget**\n• Annual projection with current pace: **$146,400 vs $144,000 budget**\n\nThe overage is within the at-risk threshold. No board action required unless the trend continues into Q3.`
    }
    if (m.includes('draft approval')) {
      return `Here's a draft approval note for **${task.invoiceNum}**:\n\n---\n*Approved by the Cardinal Hills HOA Board on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Invoice ${task.invoiceNum} from ${task.title} in the amount of ${task.amount} has been reviewed and approved for payment. Services rendered are consistent with the executed contract and prior billing history.*\n---\n\nCopy and paste this into the Add Comment field, then tap Approve.`
    }
    if (m.includes('flag')) {
      return `To flag **${task.invoiceNum}** for review:\n\n• Use **Add Comment** to note your concern (amount discrepancy, scope question, etc.)\n• The invoice will remain pending and won't auto-approve\n• Management will be notified to follow up with the vendor\n\nWhat's the specific concern? I can help you draft a precise comment.`
    }
  }

  /* ── ACC card responses ───────────────────────────── */
  if (task?.type === 'ACC') {
    if (m.includes("cc&r") || m.includes('requirement')) {
      const rules = task.accType === 'Solar Panel Installation'
        ? "Per CC&R **§4.2 — Architectural Guidelines**:\n\n• Solar panels are permitted but require prior ACC approval\n• Panels must be installed on rear or non-street-facing roof sections where feasible\n• Color and framing must be low-profile and blend with the roof material\n• Installation must comply with all local building permits\n\nThis request will need a stipulation addressing panel placement."
        : "Per CC&R **§4.2 — Architectural Guidelines**:\n\n• Decks and patio structures require prior ACC approval\n• Materials must be compatible with the home's exterior (wood, composite, or painted to match)\n• Setback requirements from property lines must be met per city code\n• Footings and structural elements must be permitted by the city\n\nThis request appears to meet standard guidelines."
      return rules
    }
    if (m.includes('similar') || m.includes('past request')) {
      const similar = task.accType === 'Solar Panel Installation'
        ? "3 solar panel requests in the last 24 months:\n\n• **512 W Birch Ct** — Approved with stipulations (rear-facing, Apr 2025)\n• **308 E Magnolia** — Approved with stipulations (side elevation, Jan 2025)\n• **791 N Cedar Ln** — Denied (front-facing placement not corrected, Aug 2024)\n\nAll approvals included the rear/non-street-facing stipulation."
        : "4 deck installation requests in the last 24 months:\n\n• **210 W Oak Ave** — Approved (composite material, Jun 2025)\n• **445 E Juniper Dr** — Approved (wood, painted to match, Mar 2025)\n• **88 N Maple Ct** — Approved with stipulations (railing height adjustment, Nov 2024)\n• **623 S Birch Ln** — Denied (exceeded setback requirements, Jul 2024)\n\nThis request appears consistent with approved precedents."
      return similar
    }
    if (m.includes('draft approval') || m.includes('approval letter')) {
      return `Here's a draft approval letter for **${task.address}**:\n\n---\n*Dear Property Owner,*\n\n*The Cardinal Hills HOA Architectural Control Committee has reviewed your request for a ${task.accType} at ${task.address}.*\n\n*Your request is hereby **APPROVED** subject to the following stipulations:*\n*1. All work must comply with applicable city building codes and permits.*\n*2. Installation must follow the specifications submitted with this application.*\n*3. Work must be completed within 90 days of this approval.*\n\n*Sincerely, Cardinal Hills HOA Board of Directors*\n\n---\n\nPaste this into Add Decision and select "Approve with stipulations."`
    }
    if (m.includes('draft denial') || m.includes('denial letter')) {
      return `Here's a draft denial letter for **${task.address}**:\n\n---\n*Dear Property Owner,*\n\n*The Cardinal Hills HOA Architectural Control Committee has reviewed your request for a ${task.accType} at ${task.address}.*\n\n*After careful review, your request is hereby **DENIED** for the following reason(s):*\n*1. The proposed installation does not meet the requirements of CC&R §4.2.*\n*2. You may resubmit a revised application addressing the items noted above.*\n\n*Sincerely, Cardinal Hills HOA Board of Directors*\n\n---\n\nPaste this into Add Decision and select "Deny."`
    }
  }

  /* ── Violation card responses ─────────────────────── */
  if (task?.type === 'Violation') {
    if (m.includes('fine enforcement') || m.includes('enforcement rule')) {
      return "Cardinal Hills HOA fine schedule for **${task?.violationType ?? 'violations'}**:\n\n• **1st notice** — Written warning, no fine\n• **2nd notice** — $50 fine + 15-day cure period\n• **3rd notice** — $100 fine + hearing scheduled\n• **Hearing** — Board may assess up to $250/day until corrected\n• **Lien** — If fines exceed $1,800 and remain unpaid\n\nThis violation is at 3rd notice. Fines begin automatically on the date shown unless the board intervenes."
    }
    if (m.includes('draft board note') || m.includes('board note')) {
      return `Here's a draft board note for **${task.address}**:\n\n---\n*Board Note — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}*\n\n*Re: ${task.violationType} violation at ${task.address} — Owner: ${task.ownerName}*\n\n*Owner has failed to respond to notices 1–3. The board has reviewed this matter and authorizes escalation to the association attorney for fine enforcement proceedings. Hearing date to be confirmed with management.*\n\n---\n\nPaste this into Add Board Note.`
    }
    if (m.includes('escalation') || m.includes('escalation step')) {
      return `Escalation steps for **${task.address}**:\n\n1. **Confirm hearing date** with management — should be set within 21 days of 3rd notice\n2. **Verify notice delivery** — certified mail receipt required for hearing to proceed\n3. **Board vote at hearing** — majority vote needed to impose fines\n4. **Authorize attorney** — if owner does not appear or comply within 30 days post-hearing\n5. **Lien filing** — attorney files lien if fines exceed $1,800 unpaid\n\nStep 1 and 2 should be confirmed before the next board meeting.`
    }
    if (m.includes('owner contact') || m.includes('contact history')) {
      return `Contact history for **${task.ownerName}** at ${task.address}:\n\n• **1st notice** — Mailed 03/01/2026 · No response\n• **2nd notice** — Mailed 03/22/2026 · No response\n• **3rd notice** — Mailed 04/08/2026 · No response\n• **Phone attempt** — 04/12/2026 · Voicemail left, not returned\n\nNo corrective action has been taken. Owner has been unresponsive across all contact channels.`
    }
  }

  /* ── Work Order card responses ────────────────────── */
  if (task?.type === 'WorkOrder') {
    if (m.includes('vendor history')) {
      return `**${task.vendor}** vendor record:\n\n• Active since 2020 — 34 work orders completed\n• On-time completion rate: **91%**\n• Last 5 work orders closed without disputes\n• Average response to acknowledgment: 6 hours\n• No open complaints or warranty claims\n\nVendor is reliable. The lack of receipt confirmation on this WO is atypical — follow up directly.`
    }
    if (m.includes('budget line') || m.includes('budget line check')) {
      return `Budget check for **WO ${task.woNumber}**:\n\n• Associated GL account: 50-3100-00 (Maintenance — Repairs)\n• April budget: $6,000 | Committed to date: $8,450\n• This work order: included in committed total\n• Annual projection: **$127K vs $72K budget** — already flagged as over\n\nNo additional board action needed for this WO specifically, but the Maintenance category overrun should be addressed at the next meeting.`
    }
    if (m.includes('related work order') || m.includes('related open')) {
      return `Open work orders related to **${task.location ?? 'this property/area'}**:\n\n• **WO #4810** — Pool area drain repair · Pacific Pool Services · Due 04/22\n• **WO #4798** — Irrigation system check · Green Valley Landscaping · Due 04/25\n• **WO #4772** — Common area lighting · Arrow Electric · Completed 04/14\n\nNo conflicts in scheduling. ${task.vendor} is not assigned to any other active WOs.`
    }
    if (m.includes('draft status') || m.includes('status note')) {
      return `Here's a draft status note for **WO ${task.woNumber}**:\n\n---\n*Status update — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}*\n\n*Board followed up with ${task.vendor} regarding WO ${task.woNumber}. Vendor confirmed receipt and advised work is ${task.status?.toLowerCase() ?? 'in progress'}. Expected completion: per due date. No additional scope changes or cost overruns reported.*\n\n---\n\nPaste this into Add Note to close the paper trail.`
    }
  }

  /* ── Broadcast message crafting ─────────────────── */
  if (pathname === '/broadcast') {
    if (m.includes('pool') || m.includes('pool closure')) {
      return "Here's a draft pool closure notice:\n\n**Subject:** Community Pool — Temporary Closure\n\n*Dear Cardinal Hills Homeowners,*\n\n*Please be advised that the community pool will be temporarily closed from [start date] to [end date] for scheduled maintenance and safety inspections.*\n\n*We apologize for any inconvenience and appreciate your patience. The pool will reopen as soon as inspections are complete and we will notify you promptly.*\n\n*Thank you,*\n*Cardinal Hills HOA Board of Directors*\n\nPaste this into the Message field and update the dates."
    }
    if (m.includes('parking') || m.includes('parking rule') || m.includes('rule reminder')) {
      return "Here's a parking rule reminder draft:\n\n**Subject:** Parking Reminder — Please Review Community Rules\n\n*Dear Cardinal Hills Residents,*\n\n*We want to remind all residents of our community parking guidelines:*\n\n*• Vehicles must be parked in designated spaces only*\n*• No overnight parking on community streets between 11 PM – 6 AM*\n*• Inoperable or unregistered vehicles must be removed within 72 hours*\n*• Guest parking is limited to [X] consecutive days*\n\n*Violations may result in a warning notice followed by towing at owner's expense. Thank you for keeping our community safe and accessible.*\n\n*Cardinal Hills HOA Board*\n\nCustomize the rules as needed and paste into the Message field."
    }
    if (m.includes('maintenance') || m.includes('maintenance alert')) {
      return "Here's a maintenance alert template:\n\n**Subject:** Scheduled Maintenance — [Area/System] Notice\n\n*Dear Cardinal Hills Residents,*\n\n*Please be advised that scheduled maintenance will be performed on [area/system — e.g., irrigation system, common area lighting, pool equipment] on [date] between [start time] and [end time].*\n\n*During this time, [describe any impact — e.g., 'the pool will be inaccessible' / 'water service may be briefly interrupted in Building C'].*\n\n*We apologize for any inconvenience. If you have questions, please contact management at [contact info].*\n\n*Cardinal Hills HOA Board of Directors*\n\nFill in the bracketed fields and paste into the Message field."
    }
    if (m.includes('emergency') || m.includes('emergency notice')) {
      return "Here's an emergency notice template:\n\n**Subject:** URGENT — [Brief Description]\n\n*Dear Cardinal Hills Residents,*\n\n*This is an urgent notice regarding [brief description of situation].*\n\n*Effective immediately: [describe required action or precaution — e.g., 'please avoid the pool area', 'do not use tap water until further notice', 'the main gate will be closed until repairs are complete'].*\n\n*We are actively working to resolve this situation and will provide updates as they become available. For immediate concerns, please contact [emergency contact].*\n\n*Cardinal Hills HOA Board of Directors*\n\nFor emergency broadcasts, make sure to select all audience sections and all delivery methods."
    }
    if (m.includes('draft') || m.includes('write') || m.includes('help')) {
      return "I can draft broadcast messages for common HOA situations. Try asking me:\n\n• **Pool closure notice** — temporary or seasonal\n• **Parking rule reminder** — courtesy or enforcement\n• **Maintenance alert** — scheduled work affecting residents\n• **Emergency notice** — urgent community-wide alert\n• Or describe your specific situation and I'll write a custom draft"
    }
  }

  /* ── Meeting agenda responses ────────────────────── */
  if (pathname === '/meeting') {
    if (m.includes('consent calendar') || m.includes('consent')) {
      return "The **Consent Calendar** bundles routine approvals into a single board vote — if no member pulls an item for separate discussion, the whole batch passes with one motion.\n\nTonight's consent calendar includes:\n\n• **Minutes** — approval of the prior meeting minutes\n• **Financials** — acceptance of the March 2026 financial statements\n• **Delinquency report** — acknowledgment of current delinquency status\n• **Investment report** — review of reserve fund investment activity\n\nIf you have questions about any of these, you can pull the item off consent and discuss it separately before voting."
    }
    if (m.includes('violation hearing') || m.includes('hearing')) {
      return "Tonight's Executive Session includes **9 violation hearings**. Each requires a board vote on a fine decision after giving the homeowner an opportunity to speak.\n\nKnown cases on the docket:\n\n• **Tang** — Landscaping violation, 3rd notice\n• **Chen** — Exterior paint non-compliance, 2nd hearing\n• **Ahluwalia** — Unauthorized structure, 3rd notice\n• **+ 6 additional cases** — details in the hearing packets\n\nFor each hearing: owner presents (or is absent), board deliberates in exec session, then votes to impose, waive, or defer the fine. A majority vote is required."
    }
    if (m.includes('delinquency') || m.includes('lien') || m.includes('foreclosure')) {
      return "The **Delinquency Decisions** item covers 4 accounts that have reached lien or foreclosure authorization stage:\n\n• Board must vote to **authorize the association attorney** to proceed with lien filing or foreclosure action on each account\n• Accounts at this stage have typically exhausted 3+ collection notices and payment plans\n• A majority board vote is required to authorize each account\n\nThis is handled in Executive Session — no owners are present. Board members should review the delinquency packets provided by management before voting."
    }
    if (m.includes('how to vote') || m.includes('voting') || m.includes('vote tonight')) {
      return "Here's how voting works for tonight's items:\n\n**General Session**\n• **Consent Calendar** — one motion covers all items unless pulled. Board member makes a motion, second required, then majority vote.\n• **New Business** — holiday lighting and perimeter restroom each need a separate motion and majority vote.\n\n**Executive Session** (board members only)\n• **Exec Minutes** — motion, second, majority vote\n• **Violation Hearings** — for each of the 9 cases: motion to impose/waive fine, second, majority vote\n• **Delinquency** — motion to authorize attorney for each account, second, majority vote\n\nQuorum tonight requires at least 3 of 5 board members present. All votes are recorded in the minutes."
    }
  }

  /* ── General responses ────────────────────────────── */
  if (m.includes('rule') || m.includes('regulation') || m.includes("cc&r")) {
    return "Cardinal Hills HOA is governed by the CC&Rs recorded in 2018, with amendments in 2021 and 2023. Key areas include architectural guidelines, landscaping standards, parking rules, and noise ordinances.\n\nWhat specific rule or topic are you looking for?"
  }
  if (m.includes('board') || m.includes('duty') || m.includes('role') || m.includes('responsib')) {
    return "As a Cardinal Hills board member your core responsibilities are:\n\n• **Fiduciary duty** — act in the financial interest of the association\n• Approve annual budgets and reserve studies\n• Enforce CC&Rs and bylaws consistently\n• Approve or deny architectural change requests\n• Attend and vote at monthly board meetings\n\nIs there a specific area you'd like guidance on?"
  }
  if (m.includes('meeting') || m.includes('agenda') || m.includes('schedule')) {
    return "The next board meeting is scheduled for **May 14, 2026 at 5:30 PM** via Zoom. The agenda includes: reserve study update, Q1 financial review, 3 ACC appeals, and the Maintenance contractor contract renewal.\n\nWant me to summarize any of the agenda items?"
  }

  return `I can help with that. Could you be more specific? I can cover vendor history, budget details, CC&R rules, fine enforcement, draft notes, or anything currently on your screen.`
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

/* ── Extract subject + body from a draft AI response ─── */
function extractDraft(text) {
  const subjectMatch = text.match(/\*\*Subject:\*\*\s*(.+)/)
  if (!subjectMatch) return null
  const subject = subjectMatch[1].trim()

  const lines = text.split('\n')
  const subjectIdx = lines.findIndex(l => l.includes('**Subject:**'))

  const bodyLines = []
  let inBody = false
  for (let i = subjectIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    // Stop before trailing instruction line
    if (/^(Paste this|Copy this|Copy and paste|Fill in|Customize)/i.test(line.trim())) break
    if (!inBody && line.trim() === '') continue // skip leading blank
    inBody = true
    // Strip markdown bold/italic markers
    bodyLines.push(line.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1'))
  }
  // Trim trailing blank lines
  while (bodyLines.length && bodyLines[bodyLines.length - 1].trim() === '') bodyLines.pop()

  const message = bodyLines.join('\n').trim()
  return message ? { subject, message } : null
}

/* ── Component ────────────────────────────────────────── */
export default function CephAIChat() {
  const { chatOpen, setChatOpen, activeTask, setBroadcastDraft } = useMode()
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
    if (text) setSuggestions(prev => prev.filter(s => s !== text))
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      const response = getAIResponse(msg, pathname, activeTask)
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
          {messages.map((msg, i) => {
            const draft = msg.role === 'ai' && pathname === '/broadcast' ? extractDraft(msg.text) : null
            return (
              <div key={i} className={`cephai-bubble cephai-bubble--${msg.role}`}>
                {msg.role === 'ai' && (
                  <img src={CEPHAI_LOGO} alt="" className="cephai-bubble__avatar" />
                )}
                <div className="cephai-bubble__body">
                  {msg.role === 'ai'
                    ? <div className="cephai-bubble__text">
                        {renderText(msg.text, msg.role === 'ai' && pathname === '/tasks' ? () => setChatOpen(false) : null)}
                        {draft && (
                          <button
                            className="cephai-insert-btn"
                            onClick={() => {
                              setBroadcastDraft(draft)
                              setChatOpen(false)
                            }}
                          >
                            <InsertIcon /> Insert Message
                          </button>
                        )}
                      </div>
                    : <div className="cephai-bubble__text">{msg.text}</div>
                  }
                </div>
              </div>
            )
          })}

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

function InsertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 12 12 17 7 12"/>
      <line x1="12" y1="5" x2="12" y2="17"/>
      <line x1="5" y1="21" x2="19" y2="21"/>
    </svg>
  )
}
