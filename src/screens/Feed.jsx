import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMode } from '../ModeContext'
import './Feed.css'
import CalendarCheckSvg from '../ICONS/calendar-check.svg'
import WorkSvg from '../Illustrations/Work.svg'
import EmailsSvg from '../Illustrations/emails.svg'
import WOSvg from '../Illustrations/WO.svg'
import InvoicesSvg from '../Illustrations/invoices.svg'
import ViolationsSvg from '../Illustrations/violations.svg'

const CINC_ICON     = '/images/cinc-icon.png'
const CEPHAI_LOGO   = '/images/cephai-logo.svg'
const RV_PHOTO      = '/images/rv-photo.jpg'
const AVATAR_1      = '/images/avatar-1.jpg'
const AVATAR_2      = '/images/avatar-2.jpg'
const AVATAR_3      = '/images/avatar-3.jpg'
const AVATAR_4      = '/images/avatar-4.jpg'
const LINKEDIN_AVT  = '/images/avatar-linkedin.jpg'

/* ── Board Members ────────────────────────────────── */
const BOARD_MEMBERS = [
  { id: 'DW', name: 'Darren Wilson',  initials: 'DW', title: 'President',             avatarImg: AVATAR_1    },
  { id: 'LT', name: 'Lisa Thomas',    initials: 'LT', title: 'Secretary',             avatarImg: AVATAR_2    },
  { id: 'TL', name: 'Thomas Lowes',   initials: 'TL', title: 'Treasurer',             avatarImg: LINKEDIN_AVT},
  { id: 'MC', name: 'Marcus Chen',    initials: 'MC', title: 'Vice President',        avatarImg: AVATAR_3    },
  { id: 'RP', name: 'Rachel Park',    initials: 'RP', title: 'Board Member at Large', avatarImg: AVATAR_4    },
]

/* ── Weekly Wrap Slides ───────────────────────────── */
const WEEKLY_SLIDES_APR12 = [
  {
    eyebrow: 'Resident Communication & Responsiveness',
    headline: 'Always On.\nAlways Responsive.',
    copy: 'We stayed connected and accessible, ensuring residents received timely responses and consistent support across all communications.',
    kpis: [
      { label: 'Resident Touchpoints', value: '153' },
      { label: 'Calls Answered', value: '55' },
      { label: 'Emails Responded', value: '98' },
      { label: 'Avg. Response Time', value: '2.3 Hrs' },
    ],
    theme: { overlayBg: '#21181A', kpiBg: '#B2DE61', kpiValueColor: '#112719', kpiLabelColor: '#112719' },
  },
  {
    eyebrow: 'Work Orders & Maintenance Execution',
    headline: 'Maintenance,\nHandled. Start\nto Finish.',
    copy: 'From intake to completion, work orders were efficiently managed and executed to keep the community running smoothly and well maintained.',
    kpis: [
      { label: 'Work Orders Received', value: '13' },
      { label: 'Assigned to Vendors', value: '13' },
      { label: 'Completed This Week', value: '7' },
      { label: 'Avg Completion Time', value: '2.1 Days' },
    ],
    theme: { overlayBg: '#AEDBBE', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#1d1d1d', headlineColor: '#21181A', copyColor: '#21181A', illustrationSize: '104%', lightBg: true },
  },
  {
    eyebrow: 'Financial Oversight & Collections',
    headline: 'Finances Managed\nwith Clarity\nand Control',
    copy: 'We maintained strong financial oversight by processing payments, driving collections, and proactively addressing delinquencies.',
    kpis: [
      { label: 'Collected', value: '$185K' },
      { label: 'Delinquent Accounts Contacted', value: '23' },
      { label: 'Invoices Processed', value: '12' },
      { label: 'Verified & Approved', value: '100%' },
    ],
    theme: { overlayBg: '#112719', kpiBg: '#AEDBBE', kpiValueColor: '#112719', kpiLabelColor: '#112719' },
  },
  {
    eyebrow: 'Violations & Compliance',
    headline: 'Standards Upheld.\nCommunity\nProtected.',
    copy: 'We consistently enforced community rules, addressed violations, and followed up on repeat issues to maintain the integrity of the community.',
    kpis: [
      { label: 'Violations Issued', value: '18' },
      { label: 'Resolved', value: '11' },
      { label: 'Repeat Cases Escalated', value: '3' },
      { label: 'Resolution Rate', value: '61%' },
    ],
    theme: { overlayBg: '#B2DE61', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#1d1d1d', headlineColor: '#21181A', copyColor: '#21181A', lightBg: true },
  },
  {
    eyebrow: 'Architectural Requests (ARC)',
    headline: 'Thoughtful\nReviews. Consistent\nStandards.',
    copy: 'Architectural requests were reviewed efficiently and fairly, ensuring alignment with community guidelines while maintaining timely approvals.',
    kpis: [
      { label: 'ARC Requests Received', value: '5' },
      { label: 'Approved', value: '4' },
      { label: 'Pending Review', value: '1' },
      { label: 'Avg Review Time', value: '3.2 Days' },
    ],
  },
]

const WEEKLY_SLIDES_APR19 = [
  {
    eyebrow: 'Resident Communication & Responsiveness',
    headline: 'Present.\nProactive.\nReliable.',
    copy: 'Residents reached out and we answered — quickly and thoroughly. Every touchpoint was handled with care and follow-through.',
    kpis: [
      { label: 'Resident Touchpoints', value: '162' },
      { label: 'Calls Answered', value: '58' },
      { label: 'Emails Responded', value: '104' },
      { label: 'Avg. Response Time', value: '2.1 Hrs' },
    ],
    theme: { overlayBg: '#21181A', kpiBg: '#B2DE61', kpiValueColor: '#112719', kpiLabelColor: '#112719' },
  },
  {
    eyebrow: 'Work Orders & Maintenance Execution',
    headline: 'Efficient.\nEffective.\nDone Right.',
    copy: 'Work orders moved from intake to resolution without bottlenecks. Vendor coordination kept everything on schedule.',
    kpis: [
      { label: 'Work Orders Received', value: '11' },
      { label: 'Assigned to Vendors', value: '11' },
      { label: 'Completed This Week', value: '8' },
      { label: 'Avg Completion Time', value: '1.9 Days' },
    ],
    theme: { overlayBg: '#AEDBBE', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#1d1d1d', headlineColor: '#21181A', copyColor: '#21181A', illustrationSize: '104%', lightBg: true },
  },
  {
    eyebrow: 'Financial Oversight & Collections',
    headline: 'Collected.\nVerified.\nClosed.',
    copy: 'Another strong collections week. Delinquency outreach continued with positive response rates from affected accounts.',
    kpis: [
      { label: 'Collected', value: '$172K' },
      { label: 'Delinquent Accounts Contacted', value: '19' },
      { label: 'Invoices Processed', value: '10' },
      { label: 'Verified & Approved', value: '100%' },
    ],
    theme: { overlayBg: '#112719', kpiBg: '#AEDBBE', kpiValueColor: '#112719', kpiLabelColor: '#112719' },
  },
  {
    eyebrow: 'Violations & Compliance',
    headline: 'Noticed.\nNotified.\nResolved.',
    copy: 'Violations were identified, notices issued promptly, and follow-up tracked. Community standards held firm.',
    kpis: [
      { label: 'Violations Issued', value: '14' },
      { label: 'Resolved', value: '9' },
      { label: 'Repeat Cases Escalated', value: '2' },
      { label: 'Resolution Rate', value: '64%' },
    ],
    theme: { overlayBg: '#B2DE61', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#1d1d1d', headlineColor: '#21181A', copyColor: '#21181A', lightBg: true },
  },
  {
    eyebrow: 'Architectural Requests (ARC)',
    headline: 'Reviewed.\nDecided.\nOn Time.',
    copy: 'ARC requests were processed efficiently, with decisions communicated clearly to homeowners within the required timeframe.',
    kpis: [
      { label: 'ARC Requests Received', value: '4' },
      { label: 'Approved', value: '3' },
      { label: 'Pending Review', value: '1' },
      { label: 'Avg Review Time', value: '2.8 Days' },
    ],
  },
]

const WEEKLY_SLIDES_MAR22 = [
  {
    eyebrow: 'Resident Communication & Responsiveness',
    headline: 'Connected.\nResponsive.\nThere When\nIt Counts.',
    copy: 'A high-volume week for resident inquiries. Our team stayed on top of every message and call, delivering consistent, timely communication.',
    kpis: [
      { label: 'Resident Touchpoints', value: '141' },
      { label: 'Calls Answered', value: '49' },
      { label: 'Emails Responded', value: '92' },
      { label: 'Avg. Response Time', value: '2.6 Hrs' },
    ],
    theme: { overlayBg: '#21181A', kpiBg: '#B2DE61', kpiValueColor: '#112719', kpiLabelColor: '#112719' },
  },
  {
    eyebrow: 'Work Orders & Maintenance Execution',
    headline: 'Received.\nAssigned.\nMoving.',
    copy: 'Maintenance requests came in strong this week. All were assigned and the majority are on track for completion within the SLA window.',
    kpis: [
      { label: 'Work Orders Received', value: '15' },
      { label: 'Assigned to Vendors', value: '14' },
      { label: 'Completed This Week', value: '6' },
      { label: 'Avg Completion Time', value: '2.4 Days' },
    ],
    theme: { overlayBg: '#AEDBBE', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#1d1d1d', headlineColor: '#21181A', copyColor: '#21181A', illustrationSize: '104%', lightBg: true },
  },
  {
    eyebrow: 'Financial Oversight & Collections',
    headline: 'Strong Month.\nStronger\nFinish.',
    copy: 'March collections are running ahead of pace. Invoices were processed and approved without delay as we close the month.',
    kpis: [
      { label: 'Collected', value: '$195K' },
      { label: 'Delinquent Accounts Contacted', value: '26' },
      { label: 'Invoices Processed', value: '14' },
      { label: 'Verified & Approved', value: '100%' },
    ],
    theme: { overlayBg: '#112719', kpiBg: '#AEDBBE', kpiValueColor: '#112719', kpiLabelColor: '#112719' },
  },
  {
    eyebrow: 'Violations & Compliance',
    headline: 'Active Week.\nHigh Volume.\nHandled.',
    copy: 'This was one of our busiest violation weeks of the quarter. Notices went out promptly and escalation protocols were followed for repeat offenders.',
    kpis: [
      { label: 'Violations Issued', value: '21' },
      { label: 'Resolved', value: '13' },
      { label: 'Repeat Cases Escalated', value: '4' },
      { label: 'Resolution Rate', value: '62%' },
    ],
    theme: { overlayBg: '#B2DE61', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#1d1d1d', headlineColor: '#21181A', copyColor: '#21181A', lightBg: true },
  },
  {
    eyebrow: 'Architectural Requests (ARC)',
    headline: 'Six Requests.\nFive Answered.',
    copy: 'A busy ARC week. Five of six submissions were reviewed and decided. The remaining request is pending additional documentation from the homeowner.',
    kpis: [
      { label: 'ARC Requests Received', value: '6' },
      { label: 'Approved', value: '5' },
      { label: 'Pending Review', value: '1' },
      { label: 'Avg Review Time', value: '3.5 Days' },
    ],
  },
]

const WEEKLY_SLIDES_MAR15 = [
  {
    eyebrow: 'Resident Communication & Responsiveness',
    headline: 'Steady.\nSupportive.\nOn Point.',
    copy: 'A well-balanced week for resident communications. Response times improved and we maintained high satisfaction across all channels.',
    kpis: [
      { label: 'Resident Touchpoints', value: '158' },
      { label: 'Calls Answered', value: '61' },
      { label: 'Emails Responded', value: '97' },
      { label: 'Avg. Response Time', value: '2.0 Hrs' },
    ],
    theme: { overlayBg: '#21181A', kpiBg: '#B2DE61', kpiValueColor: '#112719', kpiLabelColor: '#112719' },
  },
  {
    eyebrow: 'Work Orders & Maintenance Execution',
    headline: 'Nine Completed.\nZero Left\nBehind.',
    copy: 'Excellent completion rate this week. Our vendor network executed efficiently with no open items aging past the SLA threshold.',
    kpis: [
      { label: 'Work Orders Received', value: '12' },
      { label: 'Assigned to Vendors', value: '12' },
      { label: 'Completed This Week', value: '9' },
      { label: 'Avg Completion Time', value: '1.8 Days' },
    ],
    theme: { overlayBg: '#AEDBBE', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#1d1d1d', headlineColor: '#21181A', copyColor: '#21181A', illustrationSize: '104%', lightBg: true },
  },
  {
    eyebrow: 'Financial Oversight & Collections',
    headline: 'Collected.\nApproved.\nOn Track.',
    copy: 'Collections remain solid mid-month. All invoices were reviewed and approved without exception. Delinquency contacts are yielding results.',
    kpis: [
      { label: 'Collected', value: '$166K' },
      { label: 'Delinquent Accounts Contacted', value: '21' },
      { label: 'Invoices Processed', value: '11' },
      { label: 'Verified & Approved', value: '100%' },
    ],
    theme: { overlayBg: '#112719', kpiBg: '#AEDBBE', kpiValueColor: '#112719', kpiLabelColor: '#112719' },
  },
  {
    eyebrow: 'Violations & Compliance',
    headline: 'Swift.\nFair.\nResolved.',
    copy: 'Violations were issued and tracked with consistency. Resolution this week was above average, a sign our enforcement notices are working.',
    kpis: [
      { label: 'Violations Issued', value: '16' },
      { label: 'Resolved', value: '10' },
      { label: 'Repeat Cases Escalated', value: '2' },
      { label: 'Resolution Rate', value: '63%' },
    ],
    theme: { overlayBg: '#B2DE61', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#1d1d1d', headlineColor: '#21181A', copyColor: '#21181A', lightBg: true },
  },
  {
    eyebrow: 'Architectural Requests (ARC)',
    headline: 'Three Requests.\nAll Decided.',
    copy: 'All three ARC submissions received this week were reviewed and approved. Homeowners notified within our standard turnaround window.',
    kpis: [
      { label: 'ARC Requests Received', value: '3' },
      { label: 'Approved', value: '3' },
      { label: 'Pending Review', value: '0' },
      { label: 'Avg Review Time', value: '2.1 Days' },
    ],
  },
]

/* ── Monthly Wrap Slides (amber theme) ───────────── */
const MONTHLY_SLIDES_FEB = [
  {
    eyebrow: 'February 2026 — Communication',
    headline: 'A Month of\nSteady\nConnection.',
    copy: 'February brought consistent resident engagement across every channel. Our team maintained high responsiveness throughout the month.',
    kpis: [
      { label: 'Resident Touchpoints', value: '621' },
      { label: 'Calls Answered', value: '224' },
      { label: 'Emails Responded', value: '397' },
      { label: 'Avg. Response Time', value: '2.5 Hrs' },
    ],
    theme: { overlayBg: '#1A1508', kpiBg: '#E8AF48', kpiValueColor: '#1A1508', kpiLabelColor: '#1A1508' },
  },
  {
    eyebrow: 'February 2026 — Maintenance',
    headline: 'Maintenance\nKept Moving\nAll Month.',
    copy: 'Work orders were received, assigned, and tracked throughout February. Vendor coordination held steady even through a busy mid-month period.',
    kpis: [
      { label: 'Work Orders Received', value: '52' },
      { label: 'Assigned to Vendors', value: '51' },
      { label: 'Completed This Month', value: '38' },
      { label: 'Avg Completion Time', value: '2.2 Days' },
    ],
    theme: { overlayBg: '#FFF8EA', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#7A5A00', headlineColor: '#21181A', copyColor: '#3A2A00', lightBg: true },
  },
  {
    eyebrow: 'February 2026 — Financials',
    headline: 'Collections\nOn Target.\nBooks Closed.',
    copy: 'February financials closed with collections at target. The Magnolia Drive repair was absorbed within budget with no reserve impact.',
    kpis: [
      { label: 'Collected', value: '$178K' },
      { label: 'Delinquent Accounts Contacted', value: '84' },
      { label: 'Invoices Processed', value: '43' },
      { label: 'Verified & Approved', value: '100%' },
    ],
    theme: { overlayBg: '#3D2800', kpiBg: '#E8AF48', kpiValueColor: '#1A1508', kpiLabelColor: '#1A1508' },
  },
  {
    eyebrow: 'February 2026 — Violations',
    headline: 'Consistent\nEnforcement.\nEvery Week.',
    copy: 'Community standards were upheld throughout February with a steady pace of notices, follow-ups, and resolutions.',
    kpis: [
      { label: 'Violations Issued', value: '67' },
      { label: 'Resolved', value: '44' },
      { label: 'Repeat Cases Escalated', value: '11' },
      { label: 'Resolution Rate', value: '66%' },
    ],
    theme: { overlayBg: '#E8AF48', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#3D2800', headlineColor: '#1A1508', copyColor: '#1A1508', lightBg: true },
  },
  {
    eyebrow: 'February 2026 — ARC',
    headline: 'Reviewed.\nDecided.\nOn Time.',
    copy: 'Architectural requests moved efficiently through review. Homeowners received decisions within the standard window all month.',
    kpis: [
      { label: 'ARC Requests Received', value: '14' },
      { label: 'Approved', value: '11' },
      { label: 'Pending Review', value: '3' },
      { label: 'Avg Review Time', value: '3.1 Days' },
    ],
    theme: { overlayBg: '#1A1508', kpiBg: '#E8AF48', kpiValueColor: '#1A1508', kpiLabelColor: '#1A1508' },
  },
]

const MONTHLY_SLIDES_MAR = [
  {
    eyebrow: 'March 2026 — Communication',
    headline: 'High Volume.\nHigh\nStandards.',
    copy: 'March was one of our busiest communication months. Despite increased volume, response times stayed strong and residents felt heard.',
    kpis: [
      { label: 'Resident Touchpoints', value: '598' },
      { label: 'Calls Answered', value: '210' },
      { label: 'Emails Responded', value: '388' },
      { label: 'Avg. Response Time', value: '2.4 Hrs' },
    ],
    theme: { overlayBg: '#1A1508', kpiBg: '#E8AF48', kpiValueColor: '#1A1508', kpiLabelColor: '#1A1508' },
  },
  {
    eyebrow: 'March 2026 — Maintenance',
    headline: 'Busy Month.\nWork Orders\nHandled.',
    copy: 'A surge in maintenance requests — including an emergency repair — was managed without disruption to community services.',
    kpis: [
      { label: 'Work Orders Received', value: '48' },
      { label: 'Assigned to Vendors', value: '47' },
      { label: 'Completed This Month', value: '35' },
      { label: 'Avg Completion Time', value: '2.1 Days' },
    ],
    theme: { overlayBg: '#FFF8EA', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#7A5A00', headlineColor: '#21181A', copyColor: '#3A2A00', lightBg: true },
  },
  {
    eyebrow: 'March 2026 — Financials',
    headline: 'Best Month\nfor Collections\nThis Quarter.',
    copy: 'March delivered the strongest collections of Q1. Delinquency outreach was intensive and yielded measurable results.',
    kpis: [
      { label: 'Collected', value: '$192K' },
      { label: 'Delinquent Accounts Contacted', value: '91' },
      { label: 'Invoices Processed', value: '47' },
      { label: 'Verified & Approved', value: '100%' },
    ],
    theme: { overlayBg: '#3D2800', kpiBg: '#E8AF48', kpiValueColor: '#1A1508', kpiLabelColor: '#1A1508' },
  },
  {
    eyebrow: 'March 2026 — Violations',
    headline: 'Most Active\nEnforcement\nMonth.',
    copy: 'Violations were at their highest in March, driven by seasonal activity. The team responded with consistent, fair enforcement.',
    kpis: [
      { label: 'Violations Issued', value: '71' },
      { label: 'Resolved', value: '48' },
      { label: 'Repeat Cases Escalated', value: '13' },
      { label: 'Resolution Rate', value: '68%' },
    ],
    theme: { overlayBg: '#E8AF48', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#3D2800', headlineColor: '#1A1508', copyColor: '#1A1508', lightBg: true },
  },
  {
    eyebrow: 'March 2026 — ARC',
    headline: 'Nineteen\nRequests.\nFifteen Decided.',
    copy: 'ARC activity picked up in March as spring projects began. Reviews were completed on time with clear, documented decisions.',
    kpis: [
      { label: 'ARC Requests Received', value: '19' },
      { label: 'Approved', value: '15' },
      { label: 'Pending Review', value: '4' },
      { label: 'Avg Review Time', value: '2.9 Days' },
    ],
    theme: { overlayBg: '#1A1508', kpiBg: '#E8AF48', kpiValueColor: '#1A1508', kpiLabelColor: '#1A1508' },
  },
]

const MONTHLY_SLIDES_APR = [
  {
    eyebrow: 'April 2026 — Communication',
    headline: 'April in\nFull Swing.',
    copy: 'Through April 26, resident communications have been strong. Outreach around key events and compliance notices kept the team busy.',
    kpis: [
      { label: 'Resident Touchpoints', value: '482' },
      { label: 'Calls Answered', value: '171' },
      { label: 'Emails Responded', value: '311' },
      { label: 'Avg. Response Time', value: '2.2 Hrs' },
    ],
    theme: { overlayBg: '#1A1508', kpiBg: '#E8AF48', kpiValueColor: '#1A1508', kpiLabelColor: '#1A1508' },
  },
  {
    eyebrow: 'April 2026 — Maintenance',
    headline: 'Spring\nMaintenance\nSeason Underway.',
    copy: 'April brought a wave of maintenance requests as residents prepare for warmer months. Vendor response times have been excellent.',
    kpis: [
      { label: 'Work Orders Received', value: '38' },
      { label: 'Assigned to Vendors', value: '37' },
      { label: 'Completed This Month', value: '28' },
      { label: 'Avg Completion Time', value: '2.0 Days' },
    ],
    theme: { overlayBg: '#FFF8EA', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#7A5A00', headlineColor: '#21181A', copyColor: '#3A2A00', lightBg: true },
  },
  {
    eyebrow: 'April 2026 — Financials',
    headline: 'Month-to-Date\nCollections\nOn Pace.',
    copy: 'Through April 26, collections are tracking well. New landscaping contract costs are within the approved budget envelope.',
    kpis: [
      { label: 'Collected', value: '$155K' },
      { label: 'Delinquent Accounts Contacted', value: '73' },
      { label: 'Invoices Processed', value: '36' },
      { label: 'Verified & Approved', value: '100%' },
    ],
    theme: { overlayBg: '#3D2800', kpiBg: '#E8AF48', kpiValueColor: '#1A1508', kpiLabelColor: '#1A1508' },
  },
  {
    eyebrow: 'April 2026 — Violations',
    headline: 'Spring Clean-Up\nEnforcement\nActive.',
    copy: 'April has seen active violation activity, particularly around landscaping and parking. Resolution rates are up compared to prior months.',
    kpis: [
      { label: 'Violations Issued', value: '55' },
      { label: 'Resolved', value: '38' },
      { label: 'Repeat Cases Escalated', value: '8' },
      { label: 'Resolution Rate', value: '69%' },
    ],
    theme: { overlayBg: '#E8AF48', kpiBg: '#21181A', kpiValueColor: '#FFF8EA', kpiLabelColor: '#FFF8EA', eyebrowColor: '#3D2800', headlineColor: '#1A1508', copyColor: '#1A1508', lightBg: true },
  },
  {
    eyebrow: 'April 2026 — ARC',
    headline: 'Spring Projects\nMoving Through\nARC Fast.',
    copy: 'ARC submissions are up as homeowners plan spring improvements. Our team is keeping pace with accelerated review turnarounds.',
    kpis: [
      { label: 'ARC Requests Received', value: '13' },
      { label: 'Approved', value: '10' },
      { label: 'Pending Review', value: '3' },
      { label: 'Avg Review Time', value: '2.7 Days' },
    ],
    theme: { overlayBg: '#1A1508', kpiBg: '#E8AF48', kpiValueColor: '#1A1508', kpiLabelColor: '#1A1508' },
  },
]

/* ── Quarterly Wrap Slides (teal theme) ──────────── */
const QUARTERLY_SLIDES_Q1 = [
  {
    eyebrow: 'Q1 2026 — Communication',
    headline: '13 Weeks.\n1,989 Resident\nTouchpoints.',
    copy: 'Q1 was defined by consistent, high-quality resident communication. Our team answered every call and responded to every message across the quarter.',
    kpis: [
      { label: 'Resident Touchpoints', value: '1,989' },
      { label: 'Calls Answered', value: '714' },
      { label: 'Emails Responded', value: '1,275' },
      { label: 'Avg. Response Time', value: '2.4 Hrs' },
    ],
    theme: { overlayBg: '#0D2420', kpiBg: '#4AAEA0', kpiValueColor: '#0D2420', kpiLabelColor: '#0D2420' },
  },
  {
    eyebrow: 'Q1 2026 — Maintenance',
    headline: 'A Quarter\nof Seamless\nMaintenance.',
    copy: 'Over 160 work orders received, assigned, and tracked. Our vendor network delivered reliable execution with strong completion rates.',
    kpis: [
      { label: 'Work Orders Received', value: '162' },
      { label: 'Assigned to Vendors', value: '158' },
      { label: 'Completed in Q1', value: '128' },
      { label: 'Avg Completion Time', value: '2.2 Days' },
    ],
    theme: { overlayBg: '#E0F4F2', kpiBg: '#0D2420', kpiValueColor: '#E0F4F2', kpiLabelColor: '#E0F4F2', eyebrowColor: '#0D6059', headlineColor: '#0D2420', copyColor: '#1A3A36', lightBg: true },
  },
  {
    eyebrow: 'Q1 2026 — Financials',
    headline: '$543K\nCollected\nin 13 Weeks.',
    copy: 'Q1 closed with strong collections across all three months. Reserve fund contributions hit 98% of annual target by March 31.',
    kpis: [
      { label: 'Collected', value: '$543K' },
      { label: 'Delinquent Accounts Contacted', value: '276' },
      { label: 'Invoices Processed', value: '143' },
      { label: 'Verified & Approved', value: '99.3%' },
    ],
    theme: { overlayBg: '#063B35', kpiBg: '#4AAEA0', kpiValueColor: '#063B35', kpiLabelColor: '#063B35' },
  },
  {
    eyebrow: 'Q1 2026 — Violations',
    headline: 'Standards\nUpheld All\nQuarter.',
    copy: 'Violations were monitored and enforced consistently across all 13 weeks. Escalation protocols were applied fairly and documented throughout.',
    kpis: [
      { label: 'Violations Issued', value: '219' },
      { label: 'Resolved', value: '152' },
      { label: 'Repeat Cases Escalated', value: '38' },
      { label: 'Resolution Rate', value: '69%' },
    ],
    theme: { overlayBg: '#4AAEA0', kpiBg: '#0D2420', kpiValueColor: '#E0F4F2', kpiLabelColor: '#E0F4F2', eyebrowColor: '#063B35', headlineColor: '#0D2420', copyColor: '#0D2420', lightBg: true },
  },
  {
    eyebrow: 'Q1 2026 — ARC',
    headline: 'Timely\nReviews.\nEvery Time.',
    copy: '47 architectural requests submitted, 39 approved. Every decision was documented and communicated within the required review window.',
    kpis: [
      { label: 'ARC Requests Received', value: '47' },
      { label: 'Approved', value: '39' },
      { label: 'Pending or Denied', value: '8' },
      { label: 'Avg Review Time', value: '3.0 Days' },
    ],
    theme: { overlayBg: '#0D2420', kpiBg: '#4AAEA0', kpiValueColor: '#0D2420', kpiLabelColor: '#0D2420' },
  },
]

const SLIDE_ILLUSTRATIONS = [EmailsSvg, WOSvg, InvoicesSvg, ViolationsSvg, WorkSvg]

/* ── Yearly Slides ────────────────────────────────── */
const YEARLY_SLIDES_2025 = [
  {
    eyebrow: '2025 Year in Review — Communication',
    headline: '365 Days.\n24,800+\nTouchpoints.',
    copy: 'From routine inquiries to urgent escalations, our team was reachable, responsive, and present for every resident throughout the entire year.',
    kpis: [
      { label: 'Resident Touchpoints', value: '24,812' },
      { label: 'Calls Answered', value: '9,136' },
      { label: 'Emails Responded', value: '15,676' },
      { label: 'Avg. Response Time', value: '2.3 Hrs' },
    ],
    theme: { overlayBg: '#1A0A2E', kpiBg: '#9B6DFF', kpiValueColor: '#1A0A2E', kpiLabelColor: '#1A0A2E' },
  },
  {
    eyebrow: '2025 Year in Review — Maintenance',
    headline: '700+ Work\nOrders.\nAll Handled.',
    copy: 'Every request logged, every vendor dispatched, every resident followed up with. Maintenance in 2025 ran like clockwork.',
    kpis: [
      { label: 'Work Orders Received', value: '714' },
      { label: 'Assigned to Vendors', value: '698' },
      { label: 'Completed', value: '652' },
      { label: 'Avg Completion Time', value: '2.0 Days' },
    ],
    theme: { overlayBg: '#EDE8FF', kpiBg: '#1A0A2E', kpiValueColor: '#EDE8FF', kpiLabelColor: '#EDE8FF', eyebrowColor: '#5B2FBF', headlineColor: '#1A0A2E', copyColor: '#2C1A4A', lightBg: true },
  },
  {
    eyebrow: '2025 Year in Review — Financials',
    headline: '$2.1M\nCollected.\n98% on Target.',
    copy: 'Strong collections all four quarters, disciplined invoice processing, and a reserve fund that finished the year fully funded.',
    kpis: [
      { label: 'Total Collected', value: '$2.1M' },
      { label: 'Delinquent Accounts Contacted', value: '1,104' },
      { label: 'Invoices Processed', value: '588' },
      { label: 'Reserve Fund Target Hit', value: '98%' },
    ],
    theme: { overlayBg: '#2C1060', kpiBg: '#9B6DFF', kpiValueColor: '#1A0A2E', kpiLabelColor: '#1A0A2E' },
  },
  {
    eyebrow: '2025 Year in Review — Violations',
    headline: 'Standards\nMaintained\nAll Year.',
    copy: 'Violations were tracked, escalated where needed, and resolved at a 71% rate — the highest in three years for Cardinal Hills.',
    kpis: [
      { label: 'Violations Issued', value: '876' },
      { label: 'Resolved', value: '622' },
      { label: 'Escalated', value: '148' },
      { label: 'Resolution Rate', value: '71%' },
    ],
    theme: { overlayBg: '#9B6DFF', kpiBg: '#1A0A2E', kpiValueColor: '#EDE8FF', kpiLabelColor: '#EDE8FF', eyebrowColor: '#1A0A2E', headlineColor: '#1A0A2E', copyColor: '#1A0A2E', lightBg: true },
  },
  {
    eyebrow: '2025 Year in Review — Community',
    headline: 'One Year.\nOne Community.\nMoving Forward.',
    copy: 'Thank you for trusting us with your community in 2025. We\'re proud of what we built together — and excited for what comes next.',
    kpis: [
      { label: 'ARC Requests Reviewed', value: '189' },
      { label: 'Board Meetings Supported', value: '12' },
      { label: 'Community Events', value: '6' },
      { label: 'Resident Satisfaction', value: '4.7★' },
    ],
    theme: { overlayBg: '#1A0A2E', kpiBg: '#9B6DFF', kpiValueColor: '#1A0A2E', kpiLabelColor: '#1A0A2E' },
  },
]

/* ── Wrap Stories Config ──────────────────────────── */
const WRAP_TYPE_LABELS = {
  weekly:    'Weekly Wrap',
  monthly:   'Monthly Report',
  quarterly: 'Quarterly Review',
  yearly:    'Year in Review',
}

/* ── Wrap Card Config ────────────────────────────── */
const WRAP_CONFIGS = {
  weekly: {
    eyebrow:     'Your Weekly Wrap',
    titleFn:     () => 'Here\'s What East Management Has Been Up To',
    sub:         'A quick look at the meaningful work happening behind the scenes.',
    illustration: WorkSvg,
    cardBg:      '#aedbbe',
    pillBg:      '#235237',
    pillColor:   '#a5ce9f',
    ctaBg:       '#112719',
    ctaColor:    '#B2DE61',
    eyebrowColor:'#319245',
    titleColor:  '#112719',
    subColor:    '#112719',
  },
  monthly: {
    eyebrow:     'Monthly Performance Report',
    titleFn:     period => `${period} — Management Summary`,
    sub:         'A comprehensive look at this month\'s key outcomes and performance metrics.',
    illustration: InvoicesSvg,
    cardBg:      '#3D2800',
    pillBg:      '#E8AF48',
    pillColor:   '#3D2800',
    ctaBg:       '#E8AF48',
    ctaColor:    '#1A1508',
    eyebrowColor:'#E8AF48',
    titleColor:  '#FFF8EA',
    subColor:    'rgba(255,248,234,0.75)',
  },
  quarterly: {
    eyebrow:     'Q1 2026 Quarterly Review',
    titleFn:     period => `${period} — What We Achieved Together`,
    sub:         'A full quarter of community management, delivered.',
    illustration: EmailsSvg,
    cardBg:      '#0D2420',
    pillBg:      '#4AAEA0',
    pillColor:   '#0D2420',
    ctaBg:       '#4AAEA0',
    ctaColor:    '#0D2420',
    eyebrowColor:'#4AAEA0',
    titleColor:  '#FFF8EA',
    subColor:    'rgba(255,248,234,0.75)',
  },
  yearly: {
    eyebrow:     '2025 Year in Review',
    titleFn:     () => 'A Year of Progress for Cardinal Hills',
    sub:         'Twelve months of community management — the milestones, numbers, and moments that defined 2025.',
    illustration: ViolationsSvg,
    cardBg:      '#1A0A2E',
    pillBg:      '#9B6DFF',
    pillColor:   '#1A0A2E',
    ctaBg:       '#9B6DFF',
    ctaColor:    '#1A0A2E',
    eyebrowColor:'#9B6DFF',
    titleColor:  '#F5F0FF',
    subColor:    'rgba(245,240,255,0.70)',
  },
}

/* ── Wrap Stories Overlay ─────────────────────────── */
function WrapStories({ wrap, onClose }) {
  const slides = wrap.slides
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const remainingRef = useRef(8000)
  const isHoldRef = useRef(false)
  const holdTimerRef = useRef(null)

  useEffect(() => { remainingRef.current = 8000 }, [current])

  useEffect(() => {
    if (paused) {
      clearTimeout(timerRef.current)
      if (startTimeRef.current !== null) {
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current))
        startTimeRef.current = null
      }
      return
    }
    startTimeRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      if (current >= slides.length - 1) onCloseRef.current()
      else setCurrent(c => c + 1)
    }, remainingRef.current)
    return () => clearTimeout(timerRef.current)
  }, [paused, current, slides.length])

  function handlePointerDown() {
    isHoldRef.current = false
    holdTimerRef.current = setTimeout(() => {
      isHoldRef.current = true
      setPaused(true)
    }, 200)
  }

  function handlePointerUp(e) {
    clearTimeout(holdTimerRef.current)
    if (isHoldRef.current) {
      isHoldRef.current = false
      setPaused(false)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    if (e.clientX - rect.left < rect.width / 2) {
      setCurrent(c => Math.max(0, c - 1))
    } else {
      if (current >= slides.length - 1) { onClose(); return }
      setCurrent(c => c + 1)
    }
  }

  function handlePointerLeave() {
    clearTimeout(holdTimerRef.current)
    if (isHoldRef.current) {
      isHoldRef.current = false
      setPaused(false)
    }
  }

  const slide = slides[current]
  const t = slide.theme || {}

  return (
    <div
      className={`stories-overlay${paused ? ' stories-overlay--paused' : ''}`}
      style={{ background: t.overlayBg || '#111' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <div className={`stories-progress${t.lightBg ? ' stories-progress--light' : ''}`} key={current}>
        {slides.map((_, i) => (
          <div
            key={i}
            className={`stories-bar${i < current ? ' stories-bar--done' : i === current ? ' stories-bar--active' : ''}`}
          />
        ))}
      </div>

      <div className="stories-company-row">
        <img src={CINC_ICON} alt="" className="stories-logo" />
        <div className="stories-company-info">
          <span className="stories-company-name">East Management Company</span>
          <span className="stories-company-date">{WRAP_TYPE_LABELS[wrap.wrapType]} — {wrap.period}</span>
        </div>
        <button
          className="stories-close-btn"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onClose() }}
        >
          <StoriesCloseIcon />
        </button>
      </div>

      <div className="stories-content" key={`content-${current}`}>
        <p className="stories-eyebrow stories-anim-eyebrow" style={t.eyebrowColor ? { color: t.eyebrowColor } : undefined}>{slide.eyebrow}</p>
        <h1 className="stories-headline stories-anim-headline" style={t.headlineColor ? { color: t.headlineColor } : undefined}>{slide.headline}</h1>
        <p className="stories-copy stories-anim-copy" style={t.copyColor ? { color: t.copyColor } : undefined}>{slide.copy}</p>
      </div>

      <div className="stories-illus stories-anim-illus" key={`illus-${current}`}>
        <img
          src={SLIDE_ILLUSTRATIONS[current]}
          alt=""
          className="stories-illus-svg"
          style={t.illustrationSize ? { width: t.illustrationSize, height: t.illustrationSize } : undefined}
        />
      </div>

      <div className="stories-kpis" key={`kpis-${current}`}>
        {slide.kpis.map((kpi, i) => (
          <div key={i} className="stories-kpi stories-anim-kpi" style={{ background: t.kpiBg || '#aedbbe', animationDelay: `${0.35 + i * 0.07}s` }}>
            <span className="stories-kpi__label" style={t.kpiLabelColor ? { color: t.kpiLabelColor } : undefined}>{kpi.label}</span>
            <span className="stories-kpi__value" style={t.kpiValueColor ? { color: t.kpiValueColor } : undefined}>{kpi.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Feed Items (posts + wraps) ──────────────────── */
const FEED_ITEMS = [
  /* ── Posts ── */
  {
    id: 'p1', type: 'post', name: 'Darren Wilson', initials: 'DW', date: '2026-04-24', time: '2 days ago',
    isBoardMember: true, avatarImg: AVATAR_1, image: null, likes: 7, comments: 4,
    title: 'April Board Meeting Recap — Key Decisions Made',
    body: 'Last night\'s board meeting was productive. We voted on the new landscaping contract, approved the Q1 financial audit, and passed the pool reopening plan. Full minutes will be published within 5 business days. Thank you to everyone who attended.',
  },
  {
    id: 'p2', type: 'post', name: 'Rachel Park', initials: 'RP', date: '2026-04-22', time: '4 days ago',
    isBoardMember: true, avatarImg: AVATAR_4, image: null, likes: 12, comments: 9,
    title: 'Spring Community BBQ — Save the Date: May 10th',
    body: 'Planning is underway for our annual Spring BBQ! We\'re looking at May 10th from 12–4 PM at the main pavilion. We\'ll need volunteers for setup and cleanup. Comment below if you\'re interested in helping or have ideas for activities. Let\'s make it a great day for our community!',
  },
  {
    id: 'p3', type: 'post', name: 'Lisa Thomas', initials: 'LT', date: '2026-04-18', time: '1 week ago',
    isBoardMember: true, avatarImg: AVATAR_2, image: null, likes: 8, comments: 3,
    title: 'New Landscaping Vendor Approved — GreenScape Starts May 1',
    body: 'The board has approved GreenScape Solutions as our new landscaping vendor following a competitive bid process. They came highly recommended and offered a strong proposal that includes monthly deep-clean services and seasonal planting. Their contract begins May 1st.',
  },
  {
    id: 'p4', type: 'post', name: 'Marcus Chen', initials: 'MC', date: '2026-04-15', time: 'Apr 15',
    isBoardMember: true, avatarImg: AVATAR_3, image: null, likes: 6, comments: 2,
    title: 'Internet Service Outage in Block 3 — Fully Resolved',
    body: 'Just a quick update: the internet outage affecting Block 3 has been fully resolved as of this morning. The ISP confirmed it was a fiber splice issue that has now been repaired. All residents should have full service restored. If you\'re still experiencing issues, please contact your ISP directly.',
  },
  {
    id: 'p5', type: 'post', name: 'Thomas Lowes', initials: 'TL', date: '2026-04-14', time: 'Apr 14',
    isBoardMember: true, avatarImg: LINKEDIN_AVT, image: null, likes: 9, comments: 5,
    title: 'Q1 2026 Budget Review — We\'re in Great Shape',
    body: 'Happy to report that Q1 came in 4.2% under budget. Reserve fund contributions are on track at 98% of the annual target. Collections were strong across all three months. I\'ll present the full breakdown at tonight\'s meeting, but wanted to share the good news early.',
  },
  {
    id: 'p6', type: 'post', name: 'Rachel Park', initials: 'RP', date: '2026-04-10', time: 'Apr 10',
    isBoardMember: true, avatarImg: AVATAR_4, image: null, likes: 15, comments: 11,
    title: 'Community Pool Opens May 1st — Updated Rules Inside',
    body: 'The pool will officially reopen on May 1st with new hours: 8 AM to 9 PM daily. Please note important updates: no diving in the shallow end, life jacket stations have been added at each entrance, and the guest policy now allows up to 2 guests per household per day. Full rules are posted on the community board.',
  },
  {
    id: 'p7', type: 'post', name: 'Darren Wilson', initials: 'DW', date: '2026-04-07', time: 'Apr 7',
    isBoardMember: true, avatarImg: AVATAR_1, image: null, likes: 5, comments: 2,
    title: 'April 17 Board Meeting Agenda Now Available',
    body: 'The agenda for our April 17 board meeting has been posted to the community portal. Key items include the landscaping vendor vote, Q1 financials review, pool reopening approval, and an update on the Oak Lane street light replacements. Meeting is at 6 PM via Zoom — link in the portal.',
  },
  {
    id: 'p8', type: 'post', name: 'Lisa Thomas', initials: 'LT', date: '2026-04-03', time: 'Apr 3',
    isBoardMember: true, avatarImg: AVATAR_2, image: RV_PHOTO, likes: 5, comments: 11,
    title: 'Compliance Notice: Sidewalk Obstruction — RV at Elm Court',
    body: 'An oversized RV has been parked on the sidewalk at Elm Court for several days, blocking pedestrian access. This is a violation of our community CC&Rs. The owner has been notified and given 72 hours to relocate the vehicle. Further action will follow if not resolved.',
  },
  {
    id: 'p9', type: 'post', name: 'Marcus Chen', initials: 'MC', date: '2026-03-28', time: 'Mar 28',
    isBoardMember: true, avatarImg: AVATAR_3, image: null, likes: 4, comments: 3,
    title: 'Emergency Roof Repair Approved for Unit 42',
    body: 'Following storm damage last week, the board has approved emergency repairs for Unit 42. Our contracted vendor has been dispatched and work is expected to begin by Friday. We\'re covering the initial repair under the association\'s master insurance policy. The homeowner has been notified and is cooperating.',
  },
  {
    id: 'p10', type: 'post', name: 'Thomas Lowes', initials: 'TL', date: '2026-03-24', time: 'Mar 24',
    isBoardMember: true, avatarImg: LINKEDIN_AVT, image: null, likes: 7, comments: 4,
    title: 'March Financials — Strong Month for Collections',
    body: 'March collections came in at $192K, 3.1% above target. We have 4 delinquent accounts currently in the collections process, all of which have responded to outreach. Operating expenses were in line with the budget. I\'ll have the full month-end report ready for the next meeting.',
  },
  {
    id: 'p11', type: 'post', name: 'Rachel Park', initials: 'RP', date: '2026-03-20', time: 'Mar 20',
    isBoardMember: true, avatarImg: AVATAR_4, image: null, likes: 18, comments: 14,
    title: 'Easter Egg Hunt Was a Huge Success — Thank You!',
    body: 'What an amazing morning! We had 47 kids and their families join us for the annual Easter egg hunt. Special thanks to Lisa and Marcus for helping set up early, and to all the volunteers who stuffed the eggs. Already looking forward to next year. Photos are being shared in the community app gallery.',
  },
  {
    id: 'p12', type: 'post', name: 'Darren Wilson', initials: 'DW', date: '2026-03-17', time: 'Mar 17',
    isBoardMember: true, avatarImg: AVATAR_1, image: null, likes: 6, comments: 5,
    title: 'March Board Meeting — 6 Items Voted, 2 Tabled',
    body: 'We had a productive March board meeting last night. We approved the emergency reserve fund transfer, the updated CC&R enforcement policy, three ARC requests, and the landscaping bid shortlist. Two items — the vendor contract award and pool reopening plan — were tabled pending additional information. Minutes coming soon.',
  },
  {
    id: 'p13', type: 'post', name: 'Lisa Thomas', initials: 'LT', date: '2026-03-12', time: 'Mar 12',
    isBoardMember: true, avatarImg: AVATAR_2, image: null, likes: 11, comments: 8,
    title: 'Speeding Concerns on Oak Lane — Reminder to All Residents',
    body: 'We\'ve received multiple complaints about speeding on Oak Lane, particularly in the mornings and evenings. The board has issued a reminder through the community portal and is exploring speed bump installation as a longer-term solution. Please be mindful of the 15 MPH limit throughout our community.',
  },
  {
    id: 'p14', type: 'post', name: 'Marcus Chen', initials: 'MC', date: '2026-03-05', time: 'Mar 5',
    isBoardMember: true, avatarImg: AVATAR_3, image: null, likes: 9, comments: 6,
    title: 'Internet Outage Reported in Block 3 — ISP Notified',
    body: 'Several residents in Block 3 have reported intermittent internet outages since yesterday evening. I\'ve contacted the ISP and they have acknowledged the issue. Their current ETA for resolution is 48 hours. I\'ll keep you updated as I hear more. Sorry for the inconvenience.',
  },
  {
    id: 'p15', type: 'post', name: 'Thomas Lowes', initials: 'TL', date: '2026-02-26', time: 'Feb 26',
    isBoardMember: true, avatarImg: LINKEDIN_AVT, image: null, likes: 5, comments: 3,
    title: 'February Financials Closed — Solid Start to the Year',
    body: 'February financials are now closed. Total collections came in at $178K, on par with our projections. We have 2 delinquent accounts, both of which are on payment plans. Operating costs were slightly elevated due to the plumbing repair on Magnolia Drive but remain within the approved budget.',
  },
  {
    id: 'p16', type: 'post', name: 'Rachel Park', initials: 'RP', date: '2026-02-20', time: 'Feb 20',
    isBoardMember: true, avatarImg: AVATAR_4, image: null, likes: 14, comments: 7,
    title: 'Valentine\'s Mixer Was a Lovely Evening — Thank You All',
    body: 'What a warm and wonderful evening at the clubhouse! Thank you to the 38 residents and families who came out for our Valentine\'s social. The dessert table was a huge hit, and it was great to see so many neighbors connecting. We\'ll be planning more events like this throughout the year.',
  },
  {
    id: 'p17', type: 'post', name: 'Darren Wilson', initials: 'DW', date: '2026-02-14', time: 'Feb 14',
    isBoardMember: true, avatarImg: AVATAR_1, image: null, likes: 21, comments: 13,
    title: 'Board Election Results — Welcome Marcus and Rachel!',
    body: 'The results are in! I\'m thrilled to welcome Marcus Chen as our new Vice President and Rachel Park as our new Board Member at Large. Both bring fresh perspectives and a genuine commitment to our community. We look forward to working together to continue delivering for Cardinal Hills HOA.',
  },
  {
    id: 'p18', type: 'post', name: 'Lisa Thomas', initials: 'LT', date: '2026-02-05', time: 'Feb 5',
    isBoardMember: true, avatarImg: AVATAR_2, image: null, likes: 8, comments: 4,
    title: 'February Board Meeting Recap — Budget Amendment Passed',
    body: 'We held our February board meeting yesterday with full quorum. Key outcomes: the budget amendment for the Magnolia Drive plumbing repair was passed unanimously, the annual audit engagement letter was signed, and the board election process was officially opened. Thank you to all who participated.',
  },

  /* ── Weekly Wraps ── */
  { id: 'wrap-w1', type: 'wrap', wrapType: 'weekly',    date: '2026-04-25', period: 'Apr 19 – 25',     slides: WEEKLY_SLIDES_APR19  },
  { id: 'wrap-w2', type: 'wrap', wrapType: 'weekly',    date: '2026-04-18', period: 'Apr 12 – 18',     slides: WEEKLY_SLIDES_APR12  },
  { id: 'wrap-w3', type: 'wrap', wrapType: 'weekly',    date: '2026-03-28', period: 'Mar 22 – 28',     slides: WEEKLY_SLIDES_MAR22  },
  { id: 'wrap-w4', type: 'wrap', wrapType: 'weekly',    date: '2026-03-21', period: 'Mar 15 – 21',     slides: WEEKLY_SLIDES_MAR15  },

  /* ── Monthly Wraps ── */
  { id: 'wrap-m-mar', type: 'wrap', wrapType: 'monthly', date: '2026-03-31', period: 'March 2026',      slides: MONTHLY_SLIDES_MAR   },
  { id: 'wrap-m-feb', type: 'wrap', wrapType: 'monthly', date: '2026-02-28', period: 'February 2026',   slides: MONTHLY_SLIDES_FEB   },

  /* ── Quarterly Wrap ── */
  { id: 'wrap-q1',    type: 'wrap', wrapType: 'quarterly', date: '2026-03-31', period: 'Q1 2026',       slides: QUARTERLY_SLIDES_Q1  },

  /* ── Yearly Wrap ── */
  { id: 'wrap-y2025', type: 'wrap', wrapType: 'yearly',    date: '2025-12-31', period: '2025',          slides: YEARLY_SLIDES_2025   },
]

/* ── Filter Logic ─────────────────────────────────── */
const TODAY = new Date('2026-04-26')

const MONTHS_MAP = { '1month': 1, '3months': 3, '6months': 6 }

function applyFilters(items, filters) {
  return items
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(item => {
      if (filters.timeFrame === 'custom') {
        if (filters.dateFrom && item.date < filters.dateFrom) return false
        if (filters.dateTo   && item.date > filters.dateTo)   return false
      } else if (filters.timeFrame !== 'all') {
        const months = MONTHS_MAP[filters.timeFrame]
        const cutoff = new Date('2026-04-26')
        cutoff.setMonth(cutoff.getMonth() - months)
        if (item.date < cutoff.toISOString().slice(0, 10)) return false
      }
      if (filters.members.size > 0 && item.type === 'post') {
        if (!filters.members.has(item.initials)) return false
      }
      if (filters.types.size > 0) {
        const t = item.type === 'post' ? 'post' : item.wrapType
        if (!filters.types.has(t)) return false
      }
      return true
    })
}

/* ── Main Export ──────────────────────────────────── */
export default function Feed() {
  const { isBoard } = useMode()
  return isBoard ? <BoardFeed /> : <ResidentFeed />
}

/* ── Board Feed ───────────────────────────────────── */
function BoardFeed() {
  const [digestDismissed, setDigestDismissed] = useState(false)
  const [openWrap, setOpenWrap]               = useState(null)
  const [filterOpen, setFilterOpen]           = useState(false)
  const [filters, setFilters]                 = useState({
    timeFrame: 'all',   // 'all' | '1month' | '3months' | '6months' | 'custom'
    dateFrom: '',
    dateTo: '',
    members: new Set(),
    types: new Set(),
  })
  const screenRef = useRef(null)
  const navigate  = useNavigate()

  useEffect(() => {
    if (!screenRef.current) return
    screenRef.current.style.overflow = (openWrap !== null || filterOpen) ? 'hidden' : ''
    return () => { if (screenRef.current) screenRef.current.style.overflow = '' }
  }, [openWrap, filterOpen])

  const visibleItems = applyFilters(FEED_ITEMS, filters)
  const hasActiveFilters = filters.timeFrame !== 'all' || filters.members.size > 0 || filters.types.size > 0

  function handleOpenWrap(item) {
    if (screenRef.current) screenRef.current.scrollTop = 0
    setOpenWrap(item)
  }

  return (
    <div className="screen" ref={screenRef}>
      {openWrap  && <WrapStories wrap={openWrap} onClose={() => setOpenWrap(null)} />}
      {filterOpen && (
        <FeedFilter
          filters={filters}
          onChange={setFilters}
          onClose={() => setFilterOpen(false)}
        />
      )}
      <div className="screen-inner">

        <div className="engage-row">
          <div className="engage-bar">
            <span className="engage-bar__text">Engage with Fellow Board Members</span>
            <button className="engage-bar__icon-btn"><EditIcon /></button>
          </div>
          <button
            className={`engage-filter-btn${hasActiveFilters ? ' engage-filter-btn--active' : ''}`}
            onClick={() => setFilterOpen(true)}
          >
            <SlidersIcon />
          </button>
        </div>

        <div className="alert-banner" onClick={() => navigate('/meeting')}>
          <img src={CalendarCheckSvg} alt="" className="alert-banner__icon" />
          <div className="alert-banner__body">
            <p className="alert-banner__title">Board Meeting. Tonight 5:30PM</p>
            <p className="alert-banner__text">Zoom Meeting, 9 hearing decisions pending board vote, See Agenda</p>
          </div>
          <ChevronRightIcon />
        </div>

        {!digestDismissed && (
          <div className="digest-card">
            <div className="digest-card__header">
              <div className="digest-card__author">
                <img src={CEPHAI_LOGO} alt="Cephai" className="digest-card__logo" />
                <div>
                  <p className="digest-card__name">Cephai</p>
                  <p className="digest-card__time">Now</p>
                </div>
              </div>
              <button className="digest-card__close" onClick={() => setDigestDismissed(true)} aria-label="Dismiss">✕</button>
            </div>
            <p className="digest-card__title">Hello John, Your Daily Digest is ready</p>
            <div className="digest-card__body">
              <p>I have put together the most pressing things you need to review, approve or take action on.</p>
              <ul className="digest-card__list">
                <li>3 new invoices for approval</li>
                <li>2 new ACC requests for review</li>
                <li>1 New Violation pending escalation decision</li>
                <li>1 New Work Order for review and comment</li>
                <li>2 board Tasks you need to complete</li>
              </ul>
            </div>
            <button className="cta-btn" onClick={() => navigate('/tasks')}>LET'S DO THIS</button>
          </div>
        )}

        {visibleItems.length === 0 && (
          <div className="feed-empty">
            <p>No posts match your current filters.</p>
            <button className="feed-empty__clear" onClick={() => setFilters({ timeFrame: 'all', members: new Set(), types: new Set() })}>Clear Filters</button>
          </div>
        )}

        {(() => {
          let lastMonth = null
          return visibleItems.flatMap(item => {
            const itemMonth = item.date.slice(0, 7)
            const monthLabel = new Date(item.date + 'T12:00:00').toLocaleString('en-US', { month: 'long', year: 'numeric' })
            const nodes = []
            if (itemMonth !== lastMonth) {
              nodes.push(<MonthSectionHeader key={`mh-${itemMonth}`} label={monthLabel} />)
              lastMonth = itemMonth
            }
            if (item.type === 'wrap') {
              nodes.push(<WrapCard key={item.id} item={item} onOpen={handleOpenWrap} />)
            } else {
              nodes.push(<PostCard key={item.id} post={item} />)
            }
            return nodes
          })
        })()}
      </div>
    </div>
  )
}

/* ── Resident Feed ────────────────────────────────── */
const RESIDENT_POSTS = [
  {
    id: 'r1', name: 'Dalton Thomson', initials: 'DT', time: '5 minutes ago',
    isBoardMember: true, title: 'Board Of Directors Election',
    body: 'The deadline to cast your vote is February 12. Just click in the button below and cast your vote.',
    image: RV_PHOTO, likes: 8, comments: 14, avatarImg: AVATAR_1,
  },
  {
    id: 'r2', name: 'Lisa Thomas', initials: 'LT', time: '1 Day Ago',
    isBoardMember: true, title: 'Community Pool Opening Soon',
    body: 'The pool will reopen May 1st with new hours: 8 AM – 9 PM daily. Please review the updated pool rules before your first visit.',
    image: null, likes: 5, comments: 11, avatarImg: AVATAR_2,
  },
]

function ResidentFeed() {
  return (
    <div className="screen">
      <div className="screen-inner">
        <div className="engage-row">
          <div className="engage-bar">
            <span className="engage-bar__text">Engage With Your Neighbors</span>
            <button className="engage-bar__icon-btn"><EditIcon /></button>
          </div>
          <button className="engage-filter-btn">
            <SlidersIcon />
          </button>
        </div>

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

        {RESIDENT_POSTS.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  )
}

/* ── Post Card ────────────────────────────────────── */
function PostCard({ post }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="post-card card">
      <div className="post-card__header">
        <div className="post-avatar-wrap">
          <img src={post.avatarImg} alt={post.name} className="post-avatar" />
          {post.isBoardMember && <div className="post-bm-badge" title="Board Member">BM</div>}
        </div>
        <div className="post-card__meta">
          <span className="post-card__name">{post.name}</span>
          <span className="post-card__time">{post.time}</span>
        </div>
        <button className="post-card__menu" aria-label="More options"><DotsIcon /></button>
      </div>

      <div className="post-card__content">
        <p className="post-card__title">{post.title}</p>
        <p className="post-card__body">{post.body}</p>
      </div>

      {post.image && (
        <div className="post-card__image">
          <img src={post.image} alt="Post" />
        </div>
      )}

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

/* ── Wrap Card ────────────────────────────────────── */
function WrapCard({ item, onOpen }) {
  const cfg = WRAP_CONFIGS[item.wrapType]
  return (
    <div className={`weekly-wrap weekly-wrap--${item.wrapType}`} style={{ background: cfg.cardBg }}>
      <div className="weekly-wrap__content">
        <div className="weekly-wrap__left">
          <p className="weekly-wrap__eyebrow" style={{ color: cfg.eyebrowColor }}>{cfg.eyebrow}</p>
          <span className="weekly-wrap__date-pill" style={{ background: cfg.pillBg, color: cfg.pillColor }}>
            {item.period.toUpperCase()}
          </span>
          <p className="weekly-wrap__title" style={{ color: cfg.titleColor }}>{cfg.titleFn(item.period)}</p>
          <p className="weekly-wrap__sub" style={{ color: cfg.subColor }}>{cfg.sub}</p>
        </div>
        <img src={cfg.illustration} alt="" className="weekly-wrap__illustration" />
      </div>
      <div className="weekly-wrap__btn-wrap">
        <button
          className="weekly-wrap__cta"
          style={{ background: cfg.ctaBg, color: cfg.ctaColor }}
          onClick={() => onOpen(item)}
        >
          See What We Delivered
        </button>
      </div>
    </div>
  )
}

/* ── Month Section Header ─────────────────────────── */
function MonthSectionHeader({ label }) {
  return <div className="feed-month-header">{label}</div>
}

/* ── Mini Calendar ────────────────────────────────────── */
const CAL_MONTHS = ['January','February','March','April']
const CAL_MIN = '2026-02-01'
const CAL_MAX = '2026-04-26'

function MiniCalendar({ selecting, dateFrom, dateTo, onSelect }) {
  const initMonth = dateFrom ? parseInt(dateFrom.slice(5, 7)) - 1
                  : dateTo   ? parseInt(dateTo.slice(5, 7)) - 1
                  : 3 // default: April
  const [viewMonth, setViewMonth] = useState(Math.min(Math.max(initMonth, 1), 3))
  const year = 2026
  const daysInMonth = new Date(year, viewMonth + 1, 0).getDate()
  const firstDow    = new Date(year, viewMonth, 1).getDay()

  function fmt(d) {
    return `${year}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(fmt(d))

  return (
    <div className="mini-cal">
      <div className="mini-cal__nav">
        <button className="mini-cal__nav-btn" disabled={viewMonth <= 1} onClick={() => setViewMonth(m => m - 1)}>‹</button>
        <span className="mini-cal__month">{CAL_MONTHS[viewMonth]} {year}</span>
        <button className="mini-cal__nav-btn" disabled={viewMonth >= 3} onClick={() => setViewMonth(m => m + 1)}>›</button>
      </div>
      <div className="mini-cal__weekdays">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="mini-cal__wd">{d}</div>)}
      </div>
      <div className="mini-cal__grid">
        {cells.map((ds, i) => {
          if (!ds) return <div key={`e${i}`} className="mini-cal__cell mini-cal__cell--empty" />
          const disabled  = ds < CAL_MIN || ds > CAL_MAX
          const isFrom    = ds === dateFrom
          const isTo      = ds === dateTo
          const inRange   = dateFrom && dateTo && ds > dateFrom && ds < dateTo
          const isRangeStart = inRange && new Date(ds).getDay() === 0
          const isRangeEnd   = inRange && new Date(ds).getDay() === 6
          const cls = ['mini-cal__cell',
            disabled  ? 'mini-cal__cell--disabled'    : '',
            isFrom    ? 'mini-cal__cell--from'        : '',
            isTo      ? 'mini-cal__cell--to'          : '',
            inRange   ? 'mini-cal__cell--range'       : '',
            isRangeStart ? 'mini-cal__cell--range-start' : '',
            isRangeEnd   ? 'mini-cal__cell--range-end'   : '',
          ].filter(Boolean).join(' ')
          return (
            <button key={ds} className={cls} disabled={disabled} onClick={() => onSelect(ds)}>
              {parseInt(ds.slice(8))}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Feed Filter Bottom Sheet ─────────────────────── */
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmtDate(ds) {
  if (!ds) return null
  const [,m,d] = ds.split('-')
  return `${MONTH_LABELS[parseInt(m)-1]} ${parseInt(d)}`
}

const TIME_PRESETS = [
  { value: '1month',  label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
]

const TYPE_OPTIONS = [
  { value: 'post',      label: 'Posts' },
  { value: 'weekly',    label: 'Weekly Wrap' },
  { value: 'monthly',   label: 'Monthly Wrap' },
  { value: 'quarterly', label: 'Quarterly Wrap' },
  { value: 'yearly',    label: 'Yearly Wrap' },
]

function FeedFilter({ filters, onChange, onClose }) {
  const [draft, setDraft] = useState({
    timeFrame: filters.timeFrame,
    dateFrom:  filters.dateFrom,
    dateTo:    filters.dateTo,
    members:   new Set(filters.members),
    types:     new Set(filters.types),
  })
  const [view,      setView]      = useState('main')  // 'main' | 'custom'
  const [selecting, setSelecting] = useState('from')

  /* ── custom calendar handler ── */
  function handleCalSelect(ds) {
    if (selecting === 'from') {
      setDraft(d => ({ ...d, dateFrom: ds, dateTo: d.dateTo && ds > d.dateTo ? '' : d.dateTo }))
      setSelecting('to')
    } else {
      setDraft(d => ({ ...d, dateTo: ds, dateFrom: d.dateFrom && ds < d.dateFrom ? '' : d.dateFrom }))
    }
  }

  function applyCustomRange() {
    setDraft(d => ({ ...d, timeFrame: 'custom' }))
    setView('main')
  }

  /* ── preset / member / type toggles ── */
  function togglePreset(v) {
    setDraft(d => ({ ...d, timeFrame: d.timeFrame === v ? 'all' : v }))
  }

  function toggleMember(id) {
    setDraft(d => {
      const m = new Set(d.members)
      m.has(id) ? m.delete(id) : m.add(id)
      return { ...d, members: m }
    })
  }

  function toggleType(t) {
    setDraft(d => {
      const s = new Set(d.types)
      s.has(t) ? s.delete(t) : s.add(t)
      return { ...d, types: s }
    })
  }

  function handleApply() { onChange(draft); onClose() }

  function handleClear() {
    setDraft({ timeFrame: 'all', dateFrom: '', dateTo: '', members: new Set(), types: new Set() })
    setView('main')
  }

  /* ── custom range label for chip ── */
  const customLabel = draft.timeFrame === 'custom' && draft.dateFrom
    ? `${fmtDate(draft.dateFrom)} – ${fmtDate(draft.dateTo) || '?'}`
    : 'Custom Range'

  /* ────────────────── main view ────────────────────── */
  const mainView = (
    <>
      <div className="filter-sheet__handle" />
      <div className="filter-sheet__header">
        <span className="filter-sheet__title">Filter Feed</span>
        <button className="filter-sheet__close" onClick={onClose}><StoriesCloseIcon /></button>
      </div>

      <div className="filter-section">
        <p className="filter-section__label">Time Frame</p>
        <div className="filter-chips">
          {TIME_PRESETS.map(o => (
            <button
              key={o.value}
              className={`filter-chip${draft.timeFrame === o.value ? ' filter-chip--active' : ''}`}
              onClick={() => togglePreset(o.value)}
            >
              {o.label}
            </button>
          ))}
          <button
            className={`filter-chip filter-chip--nav${draft.timeFrame === 'custom' ? ' filter-chip--active' : ''}`}
            onClick={() => { setDraft(d => ({ ...d, timeFrame: 'custom' })); setView('custom') }}
          >
            {customLabel}
            <ChevronRightSmallIcon />
          </button>
        </div>
      </div>


      <div className="filter-section">
        <p className="filter-section__label">Content Type</p>
        <div className="filter-chips">
          {TYPE_OPTIONS.map(o => (
            <button
              key={o.value}
              className={`filter-chip${draft.types.has(o.value) ? ' filter-chip--active' : ''}`}
              onClick={() => toggleType(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {draft.types.has('post') && (
      <div className="filter-section">
        <p className="filter-section__label">Board Members</p>
        <div className="filter-chips">
          <button
            className={`filter-chip${draft.members.size === 0 ? ' filter-chip--active' : ''}`}
            onClick={() => setDraft(d => ({ ...d, members: new Set() }))}
          >
            All Members
          </button>
          {BOARD_MEMBERS.map(m => (
            <button
              key={m.id}
              className={`filter-chip filter-chip--avatar${draft.members.has(m.id) ? ' filter-chip--active' : ''}`}
              onClick={() => toggleMember(m.id)}
            >
              <img src={m.avatarImg} alt={m.name} className="filter-chip__avatar" />
              <span>{m.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
      )}

      <button className="filter-apply" onClick={handleApply}>Apply Filters</button>
      <button className="filter-clear" onClick={handleClear}>Clear All</button>
    </>
  )

  /* ────────────────── custom date sub-view ─────────── */
  const customView = (
    <>
      <div className="filter-sheet__handle" />
      <div className="filter-sheet__header">
        <button className="filter-sheet__back" onClick={() => setView('main')}>
          <BackIcon />
          <span>Back</span>
        </button>
        <span className="filter-sheet__title">Custom Range</span>
        <div style={{ width: 60 }} />
      </div>

      <div className="filter-date-selectors">
        <button
          className={`filter-date-btn${selecting === 'from' ? ' filter-date-btn--active' : ''}`}
          onClick={() => setSelecting('from')}
        >
          <span className="filter-date-btn__label">From</span>
          {fmtDate(draft.dateFrom)
            ? <span className="filter-date-btn__value">{fmtDate(draft.dateFrom)}</span>
            : <span className="filter-date-btn__value filter-date-btn__value--placeholder">Select</span>}
        </button>
        <span className="filter-date-arrow">→</span>
        <button
          className={`filter-date-btn${selecting === 'to' ? ' filter-date-btn--active' : ''}`}
          onClick={() => setSelecting('to')}
        >
          <span className="filter-date-btn__label">To</span>
          {fmtDate(draft.dateTo)
            ? <span className="filter-date-btn__value">{fmtDate(draft.dateTo)}</span>
            : <span className="filter-date-btn__value filter-date-btn__value--placeholder">Select</span>}
        </button>
      </div>

      <MiniCalendar
        selecting={selecting}
        dateFrom={draft.dateFrom}
        dateTo={draft.dateTo}
        onSelect={handleCalSelect}
      />

      <button className="filter-apply" onClick={applyCustomRange}>
        Apply Date Range
      </button>
      <button className="filter-clear" onClick={() => {
        setDraft(d => ({ ...d, dateFrom: '', dateTo: '' }))
      }}>Clear Dates</button>
    </>
  )

  return (
    <>
      <div className="filter-scrim" onClick={onClose} />
      <div className="filter-sheet">
        {view === 'main' ? mainView : customView}
      </div>
    </>
  )
}

/* ── Icons ────────────────────────────────────────── */
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
function StoriesCloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
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
