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

/* ── Pulse card-level contexts (triggered by long press) ── */
const CARD_CONTEXTS = {
  'kpi:0': {
    badge: 'Open Violations',
    greeting: "**42 open violations** in April — up 12 from March. That's the sharpest month-over-month jump this fiscal year.\n\nLandscaping leads with 18 cases (spring inspection surge). Home exterior violations (11) tend to linger without direct owner contact.\n\nThe trend is still improving vs the January peak of 38, but the April spike needs attention.",
    suggestions: ["What's driving the spike?", 'Compare to January peak', 'Top violation categories', 'Enforcement recommendations'],
    qa: [
      {
        q: "What's driving the spike?",
        a: "The 12-unit increase is primarily a **spring inspection surge** — 18 of 42 open violations are landscaping-related, typical for April as the management company conducts post-winter sweeps.\n\nHome exterior violations (11) are the other main driver — these are harder to cure quickly because owners often need contractor quotes before acting.\n\nParking (7) is holding steady. The spike is seasonal but sharper than prior years — direct owner outreach on the 11 home exterior cases could accelerate resolution.",
      },
      {
        q: 'Compare to January peak',
        a: "January had **38 open violations** — April's 42 is slightly higher in count, but the context is different.\n\n• January spike: post-holiday neglect + catch-up inspection sweep\n• April spike: spring inspection surge\n\nThe key difference is **cure rate**: January was 58%, April is 73%. That means enforcement is more effective now even though the raw count is slightly higher.\n\nApril's violations are being resolved faster — the board is in a better enforcement posture than January.",
      },
      {
        q: 'Top violation categories',
        a: "April open violations by category:\n\n• **Landscaping**: 18 cases (43%) — spring inspection surge, most in active cure period\n• **Home Exterior**: 11 cases (26%) — slow to cure, require contractor work\n• **Parking**: 7 cases (17%) — consistent year-round, most resolve within 48 hrs\n• **Architectural**: 4 cases (10%) — complex, require committee review\n• **Noise/Other**: 2 cases (5%)\n\nLandscaping and Home Exterior together represent 69% of open cases.",
      },
      {
        q: 'Enforcement recommendations',
        a: "Priority actions to reduce the April count:\n\n1. **Direct owner letters** for the 11 home exterior violations — these persist longest without personal outreach; a direct letter increases cure rate by ~31%\n2. **Landscaping notices** are already queued — monitor cure rate weekly through May\n3. **Parking cases**: consider community-wide reminder broadcast (quick win, resolves ~60% without a formal notice)\n4. **Architectural cases**: schedule committee review for the 4 open cases this week to prevent them aging into escalations\n\nA targeted broadcast now could prevent 3–5 new parking violations in May.",
      },
    ],
  },
  'kpi:1': {
    badge: 'Delinquent Accounts',
    greeting: "**18 delinquent accounts** in April — down 9 from last month, which is positive. However, 3 accounts have reached lien status and 2 are pre-lien.\n\nTotal outstanding balance is $84,210. The lien accounts (Thompson, Davis, Wilson) should be confirmed with the association attorney before the next meeting.",
    suggestions: ['Lien account status', 'Payment plan options', 'Attorney escalation steps', 'Compare to last quarter'],
    qa: [
      {
        q: 'Lien account status',
        a: "3 accounts currently at lien stage:\n\n• **Thompson** — 735 E Sierra Madre · $18,400 outstanding · Lien packet submitted 3/28 · Attorney confirmed receipt\n• **Davis** — 420 E Newcomer · $14,200 outstanding · Lien packet submitted 3/28 · Attorney confirmed receipt\n• **Wilson** — 854 E Weeping Willow · $12,600 outstanding · Lien packet submitted 3/28 · **Confirmation pending**\n\nAction needed: confirm attorney has acknowledged Wilson's packet before the next meeting. Thompson and Davis are ready for foreclosure authorization vote.",
      },
      {
        q: 'Payment plan options',
        a: "Association payment plan policy:\n\n**Pre-lien accounts** (2 accounts): Standard plan available — 50% down, balance over 4 months, signed agreement required. Management can initiate without board approval.\n\n**Lien accounts** (Thompson, Davis, Wilson): Payment plans require board authorization in Executive Session and must include all accrued collection costs and attorney fees. Any arrangement that delays foreclosure proceedings must be approved by a majority board vote.\n\nThe association attorney must review any lien-stage payment plan before it's offered.",
      },
      {
        q: 'Attorney escalation steps',
        a: "Escalation timeline for the 3 lien accounts:\n\n1. **Confirm lien packet receipt** — Thompson and Davis confirmed, Wilson pending\n2. **County recorder filing** — attorney files lien (typically 2–3 weeks from submission)\n3. **30-day redemption notice** — mailed to owner after filing\n4. **Board authorization vote** — majority vote required to authorize foreclosure\n5. **Foreclosure proceedings** — attorney initiates if unpaid after redemption period\n\n**Next step**: Agendize a board vote at the May meeting to authorize foreclosure on Thompson and Davis. Wilson pending packet confirmation.",
      },
      {
        q: 'Compare to last quarter',
        a: "Delinquency trend — Q1 + April 2026:\n\n• **January**: 27 accounts · $91,200 balance\n• **February**: 24 accounts · $78,400 balance\n• **March**: 27 accounts · $64,810 balance\n• **April**: 18 accounts · $84,210 balance\n\nAccount count improved sharply (18 is the lowest since Q3 2025). However, total balance jumped $19,400 from March because 2 accounts escalated to lien stage, adding large balances to the outstanding total. Count is trending positive; dollar balance is lagging due to the lien escalations.",
      },
    ],
  },
  'kpi:2': {
    badge: 'Total Delinquency',
    greeting: "**$84,210 total delinquency** — up $19,400 from March. This is the largest single-month jump this year.\n\nThe spike is driven by two new lien escalations. Three accounts at lien stage: 735 E Sierra Madre, 420 E Newcomer, and 854 E Weeping Willow.\n\nI'd suggest confirming the attorney has received the lien packets before the next board meeting.",
    suggestions: ['Which accounts jumped?', 'Lien packet status', 'Collection timeline', 'Foreclosure risk'],
    qa: [
      {
        q: 'Which accounts jumped?',
        a: "The $19,400 March→April increase is driven by two accounts:\n\n• **Davis** (420 E Newcomer) — escalated to lien stage this month, $14,200 balance added to outstanding total\n• **Thompson** (735 E Sierra Madre) — payment plan default, $18,400 outstanding (this account had been on a plan that collapsed)\n\nThis was partially offset by **9 accounts** resolving their balances (paying in full or entering payment plans), which is why the account count dropped from 27 to 18.\n\nNet: 9 accounts resolved, 2 escalated significantly — the dollar balance went up even as the count went down.",
      },
      {
        q: 'Lien packet status',
        a: "Lien packets for all 3 accounts were submitted to the association attorney on **March 28**:\n\n• **Thompson** (735 E Sierra Madre, $18,400) — attorney confirmed receipt ✓\n• **Davis** (420 E Newcomer, $14,200) — attorney confirmed receipt ✓\n• **Wilson** (854 E Weeping Willow, $12,600) — confirmation **pending** ⚠️\n\nAction needed: follow up with management to confirm Wilson's packet was acknowledged by the attorney. Without confirmation, the lien filing clock hasn't started for Wilson.",
      },
      {
        q: 'Collection timeline',
        a: "Standard collection timeline from lien filing:\n\n• **Weeks 1–3**: Attorney files lien with county recorder\n• **Weeks 3–6**: 30-day redemption notice mailed to owner\n• **Weeks 6–10**: Board votes to authorize foreclosure (if unpaid)\n• **Months 3–6**: Attorney initiates foreclosure proceedings\n• **Months 4–8**: Most accounts settle before foreclosure completes\n\nFor Thompson and Davis, lien packets were submitted March 28 — if filing happened promptly, the redemption period may already be running. Confirm status with the attorney to know where each account stands in the timeline.",
      },
      {
        q: 'Foreclosure risk',
        a: "Thompson and Davis have both exceeded the $1,800 fine threshold and are eligible for **foreclosure authorization**.\n\n• **Thompson** ($18,400) — lien confirmed, payment plan defaulted; high risk of needing foreclosure\n• **Davis** ($14,200) — newly escalated, redemption period may deter; moderate risk\n• **Wilson** ($12,600) — packet status unconfirmed; foreclosure authorization premature until confirmed\n\nForeclosure is a last resort — statistically, 70–80% of accounts settle once the lien is recorded and owners receive legal notice. The board should authorize foreclosure for Thompson and Davis at the next meeting to signal seriousness, even if settlement is expected.",
      },
    ],
  },
  'kpi:3': {
    badge: 'Budget Variance',
    greeting: "**-$3,180 budget variance** in April — 2% over monthly budget. The overrun is driven primarily by Maintenance, which is on pace for $127K against a $72K annual budget.\n\nLandscaping is also at risk, projecting $146K vs $144K annual budget. All other categories are on track or under.",
    suggestions: ['Explain Maintenance overrun', 'Landscaping risk detail', 'Which categories are on track?', 'Full budget report'],
    qa: [
      {
        q: 'Explain Maintenance overrun',
        a: "Maintenance (GL 50-3100-00) — April detail:\n\n• Pool equipment repair: $3,200 (one-time emergency)\n• HVAC filter replacement: $1,890 (scheduled)\n• Plumbing repair — common area: $2,140 (Westside Plumbing)\n• General supplies: $1,360\n• Management overhead: $2,000\n• **Total: $10,590 vs $6,000 budget** — $4,590 over\n\nThis is the **4th consecutive month** over budget. The pool and plumbing items are non-recurring, but HVAC and supplies suggest the structural run rate is ~$7,500/month — still above the $6,000 budget. The board should request an itemized breakdown from management to determine how much is deferred prior-year repairs vs ongoing run rate.",
      },
      {
        q: 'Landscaping risk detail',
        a: "Landscaping (GL 50-3200-00):\n\n• April actual: $7,800 vs $7,200 budget — $600 over\n• YTD actual: $44,800 vs $48,000 YTD budget — still $3,200 **under** on a YTD basis\n\nThe at-risk flag comes from Q2 spring contracts. Green Valley Landscaping's Q2 scope includes a seasonal color refresh ($4,200) and irrigation audit ($2,800) — both scheduled for May. If both execute in May, the monthly variance could spike to ~$6,200 over budget.\n\nThis would push the annual projection above the $144,000 budget. The board should confirm the May scope with management and verify whether these were included in the approved contract.",
      },
      {
        q: 'Which categories are on track?',
        a: "Budget status by category — April 2026:\n\n• **Maintenance**: $10,590 / $6,000 — ❌ 76% over\n• **Landscaping**: $7,800 / $7,200 — ⚠️ 8% over, at-risk\n• **Administrative**: $4,200 / $4,600 — ✅ 9% under\n• **Pool/Amenities**: $2,100 / $2,400 — ✅ 12% under\n• **Utilities**: $3,200 / $3,800 — ✅ 16% under\n• **Insurance**: $13,000 / $13,200 — ✅ flat (paid Q1)\n• **Management Fees**: $3,490 / $3,800 — ✅ 8% under\n\n5 of 7 categories are on track or under. Maintenance is the only structural problem.",
      },
      {
        q: 'Full budget report',
        a: "April 2026 Budget Summary:\n\n**Total**: $44,180 actual vs $41,000 budget — **$3,180 over (7.8%)**\n\nBy category:\n• Maintenance $10,590 / $6,000 budget\n• Landscaping $7,800 / $7,200 budget\n• Administrative $4,200 / $4,600 budget\n• Pool/Amenities $2,100 / $2,400 budget\n• Utilities $3,200 / $3,800 budget\n• Insurance $13,000 / $13,200 budget\n• Management Fees $3,490 / $3,800 budget\n\n**Annual projection**: $586,800 vs $491,200 budget — $95,600 over. Maintenance alone accounts for $55,000 of that projected overrun. The detailed financial statements are available in the Financials section.",
      },
    ],
  },
  'bank:balance': {
    badge: 'Bank Balance Analysis',
    greeting: "**$796,960 total across both accounts** as of April 2026.\n\n• **Depository Account**: $284,620 — $23,140 pending debit (outstanding checks/ACH)\n• **Reserves Account**: $512,340 — fully registered, no pending items\n\nCash position is healthy. The Depository pending debit is normal operating float.",
    suggestions: ["What's the pending debit?", 'Compare to last month', 'Reserve fund adequacy', 'Investment opportunities'],
    qa: [
      {
        q: "What's the pending debit?",
        a: "The $23,140 pending debit in the Depository Account consists of:\n\n• **Outstanding vendor checks**: $14,800 — issued but not yet cleared (Green Valley Landscaping and Pacific Pool Services)\n• **Pending ACH** — monthly management fee: $8,340\n\nBoth are normal operating transactions expected to clear within 5 business days. No unusual or unauthorized transactions are flagged. After clearing, the effective Depository balance will be approximately $261,480.",
      },
      {
        q: 'Compare to last month',
        a: "Month-over-month balance comparison:\n\n• **Depository**: $271,480 (Mar) → $284,620 (Apr) — **+$13,140**\n• **Reserves**: $500,100 (Mar) → $512,340 (Apr) — **+$12,240** (monthly reserve contribution)\n• **Total**: $771,580 → $796,960 — **+$25,380**\n\nThe increase reflects normal monthly reserve contributions plus operating collections slightly outpacing disbursements. Cash position is healthy and trending upward.",
      },
      {
        q: 'Reserve fund adequacy',
        a: "Reserve Fund is **84% funded** — $512,340 of a $607,000 target set by the 2024 Reserve Study.\n\nAt the current contribution rate of ~$12,000/month, the fund will reach 100% funding in approximately **3.5 years** (mid-2029).\n\nThe reserve study recommends this trajectory to avoid special assessments. The biggest risk item is the pool resurfacing project (~$85K) scheduled for 2027 — this is fully anticipated in the current reserve plan. No immediate action required.",
      },
      {
        q: 'Investment opportunities',
        a: "The Reserves Account ($512,340) is currently in a money market earning approximately **4.8% APY**.\n\nThe reserve study permits investing up to 30% of reserves in CDs or Treasury bills with maturities under 24 months. The board could consider:\n\n• Ladder $150K into 12-month CDs at ~5.1–5.3% — potential +0.3–0.5% yield improvement\n• Keep remaining $362K in money market for liquidity (pool resurfacing draw expected 2027)\n\nThis strategy could generate an additional $450–750 annually. Any investment action requires a board vote. I can draft a motion if the board wants to explore this.",
      },
    ],
  },
  'bank:reserve': {
    badge: 'Reserve Fund Health',
    greeting: "**Reserve Fund is 84% funded** — $512,340 of a $607,000 target. Up 2.4 percentage points this quarter.\n\nAt current contribution rate, the fund will reach 100% in approximately 3.5 years. The reserve study recommends maintaining this trajectory to avoid special assessments.\n\nYTD violation repairs and deferred maintenance have not yet impacted the reserve balance.",
    suggestions: ['What is the funding target based on?', 'Special assessment risk?', 'Reserve study update', 'Investment performance'],
    qa: [
      {
        q: 'What is the funding target based on?',
        a: "The $607,000 target comes from the **2024 Reserve Study** conducted by Reserve Advisors, Inc.\n\nThe study evaluated **42 reserve components** including:\n• Roofing (largest single component — $185K replacement value)\n• Pool equipment and resurfacing\n• Pavement, parking lot, and curbing\n• Common area structures and fencing\n• Irrigation and lighting systems\n\nEach component was assessed for current condition, estimated useful life, and replacement cost. The $607,000 represents the fully funded threshold — the amount needed today to cover all anticipated replacements without special assessments.",
      },
      {
        q: 'Special assessment risk?',
        a: "At 84% funded, the risk of a special assessment is **low but not zero**.\n\nA special assessment would be required if:\n• A major unexpected repair depletes reserves below ~50% funded, or\n• The board elects to accelerate a large project ahead of schedule\n\nThe biggest risk item: **pool resurfacing (~$85K)** scheduled for 2027. This is fully anticipated in the current reserve plan.\n\nCurrent trajectory avoids a special assessment assuming no major unplanned events. The Maintenance budget overrun has not yet impacted reserves — but if deferred repairs continue at the current pace, the board should evaluate whether some items should be reserve-funded.",
      },
      {
        q: 'Reserve study update',
        a: "The last reserve study was completed in **2024** by Reserve Advisors, Inc.\n\nUnder California Civil Code §5550, a full on-site inspection is required every **3 years** — next full study due 2027.\n\nHowever, an **annual paper review** is typically performed each year to update cost estimates and component conditions. The 2026 annual update should be commissioned before budget season — target September 2026 for delivery before the October budget workshop.\n\nThe board should include the reserve study update in the next meeting agenda to authorize management to engage Reserve Advisors.",
      },
      {
        q: 'Investment performance',
        a: "Reserve Account investment performance:\n\n• **YTD earnings** (Jan–Apr 2026): ~$20,500 in interest\n• **Current yield**: 4.8% APY (money market)\n• **Reserve study assumption**: 3.5% annual return\n• **Outperformance**: +1.3 percentage points above projection\n\nThis favorable variance has slightly accelerated the path to 100% funding. At 4.8% vs the projected 3.5%, the fund reaches full funding approximately **5 months earlier** than the reserve study baseline.\n\nThe board could potentially improve yield further by laddering a portion into CDs — see Investment Opportunities for details.",
      },
    ],
  },
  'violations:month': {
    badge: 'Violations — April 2026',
    greeting: "**15 new violations in April** — down 4 from March's 19. The trend is improving.\n\nParking leads (5), followed by Landscaping (4) and Architectural (3). 11 of 15 have been cured already — strong cure rate.\n\nOnly 1 escalated case this month. The board is in a good enforcement posture.",
    suggestions: ['Which violations are open?', 'Escalated case details', 'Compare to March', 'Enforcement effectiveness'],
    qa: [
      {
        q: 'Which violations are open?',
        a: "Of the 15 April violations, **4 remain open** (uncured):\n\n• **3 Landscaping notices** — owners are within the active cure period (14 days remaining); no action needed yet\n• **1 Architectural** — 923 N Juniper Way (fence extension); owner requested an extension, pending committee review\n\nThe other 11 have been cured or formally resolved. The 4 open cases are all within expected timelines — no immediate escalation is required this week.",
      },
      {
        q: 'Escalated case details',
        a: "**1 escalated case this month**: 923 N Juniper Way — Unauthorized Structure (fence extension)\n\n• Owner did not respond to the 2nd notice (mailed 04/01)\n• Case referred for a **board hearing** — scheduled for May 14 Executive Session\n• The fence extension has not been removed or modified\n• This will appear in the violation hearings segment of the next meeting\n\nAction: ensure the hearing packet (photos, notice history, proof of delivery) is prepared by management before May 14.",
      },
      {
        q: 'Compare to March',
        a: "March vs April violations:\n\n• **New violations**: 19 (Mar) → 15 (Apr) — **down 4 (21% improvement)**\n• **Cure rate**: 68% (Mar) → 73% (Apr) — improving\n• **Escalations**: 2 (Mar) → 1 (Apr) — fewer cases going to hearings\n\nBy category comparison:\n• Parking: 7 → 5 (improved)\n• Landscaping: 5 → 4 (slightly improved)\n• Architectural: 4 → 3 (slightly improved)\n• Home Exterior: 3 → 3 (flat)\n\nPark enforcement showed the most improvement. The trend is moving in the right direction on all metrics.",
      },
      {
        q: 'Enforcement effectiveness',
        a: "April enforcement metrics:\n\n• **15 issued** / **11 cured** / **3 in cure period** / **1 escalated**\n• **Cure rate: 73%** — highest in 6 months\n\nMonthly cure rate trend:\n• January: 58% · February: 62% · March: 68% · **April: 73%**\n\nThe consistent month-over-month improvement correlates with the **direct owner contact protocol** implemented in February 2026. Owners who receive a personal letter (not just a template notice) show a 31% higher cure rate.\n\nCurrent enforcement posture is strong. Maintaining the direct contact protocol and keeping escalations below 2/month should be the board's target.",
      },
    ],
  },
  'violations:6mo': {
    badge: 'Violations — 6 Month Trend',
    greeting: "Looking at the last 6 months (Nov–Apr), violations **peaked in January at 38** and have been declining since.\n\nThe Jan spike was driven by post-holiday landscaping neglect and a catch-up inspection sweep. April's 15 is the lowest in 12 months.\n\nThe YTD total of 97 is on pace to come in below last year's annual figure.",
    suggestions: ['Why did January spike?', 'YTD vs last year', 'Forecast for Q2', 'Seasonal patterns'],
    qa: [
      {
        q: 'Why did January spike?',
        a: "January's 38 violations were driven by three converging factors:\n\n1. **Post-holiday landscaping neglect** — 17 of 38 were landscaping violations; owners who traveled or were distracted during the holidays let conditions deteriorate\n2. **Catch-up inspection sweep** — the management company conducted a more intensive inspection in early January after reduced inspection frequency in December\n3. **Carryover cases** — 6 unresolved cases carried over from December's light-enforcement period\n\nThe spike was partly systemic (inspection scheduling gap) and partly seasonal. It was **not** a sign of a worsening community compliance trend — the subsequent months confirmed this.",
      },
      {
        q: 'YTD vs last year',
        a: "Year-over-year comparison (Jan–Apr):\n\n• **2026 YTD**: 97 violations\n• **2025 YTD**: 112 violations\n• **Improvement**: -15 violations (**-13% year-over-year**)\n\nFull year 2025: 287 violations. If the current monthly pace continues (Apr rate of 15), 2026 is projecting approximately **210 violations for the full year** — a **27% improvement** vs 2025.\n\nEven if summer and fall are at historical averages, the full-year total is on track to significantly outperform 2025.",
      },
      {
        q: 'Forecast for Q2',
        a: "Q2 2026 forecast (May–June):\n\n• **May**: Projected 12–15 violations — landscaping violations declining as spring cleanup completes; parking stable\n• **June**: Projected 9–12 violations — summer; pool-related issues appear but landscaping improves\n• **Q2 total**: Projected **21–27 violations**\n\nFor comparison, Q2 2025 had **71 violations**. Even the high end of this forecast represents a **62% improvement** year-over-year.\n\nKey risk: if the irrigation audit in May triggers a new wave of landscaping notices, the lower end of the range may not hold. Monitor May's inspection results closely.",
      },
      {
        q: 'Seasonal patterns',
        a: "Cardinal Hills violation patterns by season (historical average):\n\n• **Q1 (Jan–Mar)**: High — post-holiday inspections, winter damage visibility, catch-up sweeps · Avg 85 violations/quarter\n• **Q2 (Apr–Jun)**: Moderate, declining — spring cleanup completion, cure rates improve · Avg 62 violations/quarter\n• **Q3 (Jul–Sep)**: Low — summer, residents traveling, fewer complaints · Avg 38 violations/quarter\n• **Q4 (Oct–Dec)**: Rising — pre-winter prep deadlines, holiday decorations, year-end inspection · Avg 72 violations/quarter\n\n**January** and **October** are historically the peak months. Planning intensive enforcement activity in September and December helps reduce the Q4 and Q1 spikes.",
      },
    ],
  },
  'violations:ytd': {
    badge: 'Violations — YTD',
    greeting: "**97 violations YTD** (Jan–Apr 2026). The trend is clearly improving — down 61% from the January peak.\n\nVS January's peak of 38, April's 15 is **-61%**. If this trajectory holds, the full-year total will likely come in below 2025.\n\nThe enforcement program appears to be working — the high cure rate (73% this month) is a strong indicator.",
    suggestions: ['Compare to 2025 full year', 'Cure rate analysis', 'Top violation types YTD', 'Forecast rest of year'],
    qa: [
      {
        q: 'Compare to 2025 full year',
        a: "2025 full year: **287 violations**\n2026 YTD (Jan–Apr): **97 violations**\n\nAt April's run rate of 15/month, the 2026 full-year projection is approximately **210 violations — a 27% improvement vs 2025**.\n\nEven using the Q2–Q4 historical average pace (not April's low), the projection lands around 235 violations — still an **18% improvement**.\n\nThe enforcement program improvements implemented in early 2026 (direct owner contact protocol, more consistent inspection scheduling) appear to be creating a durable improvement, not a one-month anomaly.",
      },
      {
        q: 'Cure rate analysis',
        a: "YTD cure rates by month:\n\n• **January**: 58% (38 violations, 22 cured)\n• **February**: 62% (23 violations, 14 cured)\n• **March**: 68% (19 violations, 13 cured)\n• **April**: 73% (15 violations, 11 cured)\n• **YTD average: 65%**\n\nThis is significantly above the 2025 annual average of **54%**. The trend is consistently upward.\n\nThe improvement is strongly correlated with the **direct owner contact protocol** launched in February — owners who receive a personal letter or call (vs. a template notice) show a 31% higher cure rate. Maintaining and expanding this protocol is the single highest-impact action the board can take.",
      },
      {
        q: 'Top violation types YTD',
        a: "Top violation types (Jan–Apr 2026, 97 total):\n\n1. **Landscaping**: 38 violations (39%) — spring inspection dominant; high cure rate\n2. **Parking**: 24 violations (25%) — consistent year-round; usually cures quickly\n3. **Home Exterior**: 19 violations (20%) — slow to cure; require contractor work\n4. **Architectural**: 11 violations (11%) — most complex; require committee review\n5. **Noise/Other**: 5 violations (5%)\n\nLandscaping and Parking together represent **64%** of all YTD violations. A targeted community broadcast addressing these two categories could meaningfully reduce the Q2 and Q3 totals.",
      },
      {
        q: 'Forecast rest of year',
        a: "Full-year 2026 forecast:\n\n• **May–Jun (Q2 remainder)**: ~24–30 violations\n• **Jul–Sep (Q3)**: ~35–45 violations (summer low)\n• **Oct–Dec (Q4)**: ~60–75 violations (fall/winter rise + year-end inspections)\n• **Full year projection**: ~216–247 violations\n\nVs 2025 full year of 287 — that's a **14–25% improvement**.\n\nKey risk: an October inspection sweep (historical pattern) could add 25–35 violations in one month. Even factoring that in, the full-year outcome is on pace to significantly outperform 2025.",
      },
    ],
  },
  'delinquencies': {
    badge: 'Top Delinquencies',
    greeting: "**5 accounts in the delinquency pipeline** — 3 at lien stage, 2 at pre-lien.\n\nThe 3 lien accounts (Thompson, Davis, Wilson) require board action: confirm the association attorney has received lien packets and authorize foreclosure proceedings if payment isn't received within 30 days.\n\nThe 2 pre-lien accounts should receive final demand letters this week.",
    suggestions: ['Lien packet status', 'Authorize foreclosure action', 'Draft demand letter', 'Payment plan options'],
    qa: [
      {
        q: 'Lien packet status',
        a: "Lien packets submitted to the association attorney on **March 28**:\n\n• **Thompson** — 735 E Sierra Madre · $18,400 · Attorney confirmed receipt ✓ · Filing in process\n• **Davis** — 420 E Newcomer · $14,200 · Attorney confirmed receipt ✓\n• **Wilson** — 854 E Weeping Willow · $12,600 · Confirmation **pending** ⚠️\n\n**Action needed**: contact management to confirm Wilson's packet was acknowledged. The lien filing clock starts from attorney receipt — without confirmation, Wilson's timeline is unknown. Thompson and Davis are ready for foreclosure authorization at the next board meeting.",
      },
      {
        q: 'Authorize foreclosure action',
        a: "To authorize foreclosure, the board votes in **Executive Session** — majority vote required for each account.\n\nSuggested motion language:\n\n*\"The Board of Directors authorizes the association attorney to initiate foreclosure proceedings against [Owner Name] at [Address] for unpaid assessments totaling $[Amount], plus accrued interest, late charges, and collection costs.\"*\n\n**Ready for vote**: Thompson (735 E Sierra Madre) and Davis (420 E Newcomer) — both lien packets confirmed.\n\n**Hold until confirmed**: Wilson (854 E Weeping Willow) — packet status unconfirmed.\n\nThis should be agendized for the May 14 Executive Session.",
      },
      {
        q: 'Draft demand letter',
        a: "Here's a draft final demand letter for the pre-lien accounts:\n\n---\n*Dear [Owner Name],*\n\n*This is a final demand notice. Your account at [Address] is delinquent in the amount of $[Balance], which includes past-due assessments, late charges, and collection costs.*\n\n*To avoid lien filing and potential foreclosure action, full payment must be received by [Date — 10 days from today]. Payment may be submitted by check payable to Cardinal Hills HOA or by contacting management to discuss a payment arrangement.*\n\n*If payment is not received by the date above, the association will proceed with lien filing without further notice.*\n\n*Sincerely,*\n*Cardinal Hills HOA Board of Directors*\n\n---\n\nProvide this to management to send via certified mail to both pre-lien accounts this week.",
      },
      {
        q: 'Payment plan options',
        a: "Payment plan policy by account stage:\n\n**Pre-lien accounts (2)**: Standard payment plan available without board approval — 50% down, balance over 4 months, signed agreement required. Management can initiate immediately. Recommended this week to avoid lien filing.\n\n**Lien accounts (Thompson, Davis, Wilson)**: Require board authorization in Executive Session. Plan must include all accrued collection costs and attorney fees. Any plan that delays or pauses foreclosure proceedings must be approved by majority vote.\n\nThe association attorney must review any lien-stage payment arrangement before it is offered to the owner.",
      },
    ],
  },
  'expenses': {
    badge: 'Expenses vs Budget',
    greeting: "**$44,180 actual vs $41,000 budget** in April — $3,180 over (7.8%).\n\nThe problem is Maintenance: $10,590 actual vs $6,000 budget — projecting **$127K annually against a $72K budget**. That's a 76% overrun.\n\nLandscaping is at-risk but manageable. All other categories are on track or under budget.",
    suggestions: ['Maintenance overrun breakdown', 'Landscaping risk detail', 'Annual projection', 'Recommend board action'],
    qa: [
      {
        q: 'Maintenance overrun breakdown',
        a: "Maintenance (GL 50-3100-00) — April itemized:\n\n• Pool equipment repair: **$3,200** (emergency, one-time)\n• Plumbing repair — common area: **$2,140** (Westside Plumbing)\n• HVAC filter replacement: **$1,890** (scheduled)\n• General supplies & materials: **$1,360**\n• Management overhead allocation: **$2,000**\n• **Total: $10,590 vs $6,000 budget**\n\nThis is the 4th consecutive month over budget. The emergency items are non-recurring, but the HVAC and supplies suggest a structural run rate of ~$7,500/month — still 25% above budget. The board should request a full itemized breakdown from management to determine how much is deferred prior-year work vs ongoing costs.",
      },
      {
        q: 'Landscaping risk detail',
        a: "Landscaping (GL 50-3200-00):\n\n• April actual: $7,800 vs $7,200 budget — **$600 over (8%)**\n• YTD actual: $44,800 vs $48,000 YTD budget — still **$3,200 under** year-to-date\n\nThe at-risk flag is forward-looking. Green Valley Landscaping's Q2 spring scope includes:\n• Seasonal color refresh: $4,200 (scheduled May)\n• Irrigation system audit: $2,800 (scheduled May)\n\nIf both execute in May, the monthly variance spikes to ~$6,800 over budget — pushing the annual projection from $146,400 to potentially $150,000+ vs $144,000 budget.\n\nConfirm with management whether these were included in the approved contract or are incremental.",
      },
      {
        q: 'Annual projection',
        a: "Full-year 2026 projection by category:\n\n• **Maintenance**: $127,080 vs $72,000 — ❌ **$55,080 over (76%)**\n• **Landscaping**: $146,400 vs $144,000 — ⚠️ $2,400 over (at-risk)\n• Administrative: $50,400 vs $55,200 — ✅ under\n• Insurance: $156,000 vs $158,400 — ✅ under\n• Utilities: $38,400 vs $45,600 — ✅ under\n• Pool/Amenities: $25,200 vs $28,800 — ✅ under\n• Management Fees: $41,880 vs $45,600 — ✅ under\n\n**Total projected**: $585,360 vs $549,600 budget — **$35,760 over (6.5%)**\n\nMaintenance is the single driver of the overall budget overrun.",
      },
      {
        q: 'Recommend board action',
        a: "Recommended board actions:\n\n1. **This week**: Request an itemized Maintenance breakdown from management — identify whether the overrun is deferred repairs (non-recurring) or structural run rate\n\n2. **May meeting**: Bring one of these options to a vote:\n   a. Reallocate savings from under-performing categories (Utilities, Pool) to Maintenance\n   b. Authorize a formal budget amendment to increase the Maintenance line\n\n3. **Ongoing**: Implement a **pre-approval threshold** for Maintenance work orders over $2,000 — board or management pre-approval before work is ordered\n\n4. **Reserve consideration**: If deferred repairs are the driver, evaluate whether these items should be reserve-funded rather than charged to the operating budget",
      },
    ],
  },
  'invoices': {
    badge: 'Approved to Pay Invoices',
    greeting: "**7 invoices totaling $18,340** approved and ready to pay this period.\n\nGreen Valley Landscaping ($6,200) and Pacific Pool Services ($3,800) are the two largest. All 7 have been reviewed and cleared.\n\nNote: the Westside Plumbing invoice ($2,140) relates to the Maintenance category that is already over budget.",
    suggestions: ['Vendor history check', 'Budget impact by vendor', 'Flag an invoice', 'Payment schedule'],
    qa: [
      {
        q: 'Vendor history check',
        a: "All 7 vendors are active and in good standing:\n\n• **Green Valley Landscaping** — Since 2019 · 156 invoices · 0 disputed · Average: $5,900\n• **Pacific Pool Services** — Since 2020 · 89 invoices · 1 disputed (resolved 2022) · Average: $3,600\n• **Westside Plumbing** — Since 2021 · 34 invoices · 0 disputed · Average: $1,980\n• **Arrow Electric** — Since 2022 · 22 invoices · 0 disputed · Average: $1,700\n• **Cardinal Property Mgmt** — Since 2018 · Ongoing management contract · Recurring monthly\n• **Desert Waste Services** — Since 2021 · Recurring monthly · No issues\n• **Allied Security** — Since 2023 · Recurring monthly · No issues\n\nNo flags or concerns on any vendor.",
      },
      {
        q: 'Budget impact by vendor',
        a: "Budget impact by GL account:\n\n• Green Valley Landscaping $6,200 → GL 50-3200 (Landscaping — **at-risk** category)\n• Pacific Pool Services $3,800 → GL 50-3300 (Pool/Amenities — under budget ✅)\n• Westside Plumbing $2,140 → GL 50-3100 (Maintenance — **OVER budget** ⚠️)\n• Arrow Electric $1,840 → GL 50-3400 (Utilities — under budget ✅)\n• Cardinal Property Mgmt $3,490 → GL 50-5000 (Management Fees — under budget ✅)\n• Desert Waste $420 → GL 50-3500 (under budget ✅)\n• Allied Security $450 → GL 50-3600 (under budget ✅)\n\nOnly the Westside Plumbing invoice adds to an over-budget category. No board action needed — it was already approved.",
      },
      {
        q: 'Flag an invoice',
        a: "To flag an invoice for review, go to the **Tasks screen** and open the relevant invoice card. Tap **Add Comment** and describe your concern — the invoice will remain pending and will not be processed until the flag is cleared.\n\nManagement will be notified and will follow up with the vendor. Common reasons to flag:\n\n• Amount discrepancy vs contract or prior invoices\n• Service listed as not yet rendered\n• Possible duplicate submission\n• Missing supporting documentation (lien waivers, permits, photos)\n\nWhich invoice do you want to flag? I can help you draft a precise comment.",
      },
      {
        q: 'Payment schedule',
        a: "Recommended payment processing schedule:\n\n• **By Apr 25**: Cardinal Property Mgmt $3,490, Desert Waste $420, Allied Security $450 — all recurring, process on standard cycle\n• **By Apr 25**: Green Valley Landscaping $6,200 — net 30 terms, due Apr 25\n• **By Apr 28**: Pacific Pool Services $3,800 — net 30 terms\n• **By Apr 30**: Westside Plumbing $2,140 — net 30 (note: hits over-budget Maintenance GL)\n• **By May 1**: Arrow Electric $1,840 — net 30 terms\n\n**Total: $18,340** · All within standard payment terms · No late payment risk if processed this week.",
      },
    ],
  },
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
  const { chatOpen, setChatOpen, activeTask, setBroadcastDraft, cephAICardContext, setCephAICardContext } = useMode()
  const { pathname } = useLocation()
  const messagesEndRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  // Resolve context: card-specific (long-press) > task card > screen-level
  function getCtx() {
    if (cephAICardContext && CARD_CONTEXTS[cephAICardContext]) {
      return CARD_CONTEXTS[cephAICardContext]
    }
    if (pathname === '/tasks' && activeTask) {
      const cardCtx = getTaskCardContext(activeTask)
      if (cardCtx) return cardCtx
    }
    return SCREEN_CONTEXTS[pathname] ?? DEFAULT_CONTEXT
  }

  // Reset and seed greeting each time panel opens
  // NOTE: cephAICardContext intentionally excluded from deps — it's set ~1800ms
  // before chatOpen flips to true, so getCtx() already sees the correct value.
  // Including it would cause the else-branch to clear it immediately on set.
  useEffect(() => {
    if (chatOpen) {
      const ctx = getCtx()
      setMessages([{ role: 'ai', text: ctx.greeting }])
      setSuggestions(ctx.suggestions)
      setInput('')
      setThinking(false)
    } else {
      setCephAICardContext(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Check card-level pre-defined Q&A first
      const cardQA = cephAICardContext && CARD_CONTEXTS[cephAICardContext]?.qa
      const matched = cardQA?.find(item => item.q.toLowerCase() === msg.toLowerCase())
      const response = matched ? matched.a : getAIResponse(msg, pathname, activeTask)
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
