import { useState, useRef, useEffect } from 'react'
import { useMode } from '../ModeContext'
import { useNavigate } from 'react-router-dom'
import './Tasks.css'
import VendorSvg    from '../ICONS/Vendor.svg'
import AttachSvg    from '../ICONS/Attachment.svg'
import ThumbsUpSvg  from '../ICONS/Thumbs-up.svg'
import BankSvg      from '../ICONS/Bank.svg'
import WoSvg        from '../ICONS/wo.svg'
import LogSvg       from '../ICONS/log.svg'
import ChecklistSvg from '../ICONS/checklist.svg'
import ChatSvg      from '../ICONS/Chat.svg'
const TYPE_ILLUSTRATIONS = {
  Invoice:   { src: '/images/card-invoice.jpg'   },
  WorkOrder: { src: '/images/card-workorder.jpg' },
  Violation: { src: '/images/card-violation.jpg' },
  ACC:       { src: '/images/card-acc.jpg'       },
  Task:      { src: '/images/card-task.jpg'      },
}

const TASKS = [
  {
    id: 1,
    type: 'Invoice',
    title: 'Green Valley Landscaping',
    invoiceNum: 'GVL_042026',
    invoicedDate: '04/01/2026',
    dueDate: '04/15/2026',
    glAccount: '50-2100-00',
    glDescription: 'Landscaping — Monthly Contract',
    amount: '$6,200.00',
    approversCount: 1,
    due: 'Due today',
    urgency: 'urgent',
    actionLabel: 'Approve',
    vendorInfo: { contact: 'Michael Reed', email: 'info@greenvalley.com', phone: '305.555.0142', website: 'www.greenvalleylandscaping.com', address: '245 Green Way, Miami, FL 33131', type: 'Landscaping', recentPayments: 8, currentWOs: 2, woAll: 29, woOpen: 1, woInProgress: 3, woCompleted: 25, totalInvoices: 23, totalAmount: '$25,568.00' },
    approvers: [{ name: 'Sarah Mitchell', role: 'President', initials: 'SM', vote: 'approve', votedAt: 'Apr 2, 2026 · 9:14 AM' }],
  },
  {
    id: 2,
    type: 'Invoice',
    title: 'Pacific Pool Services',
    invoiceNum: 'PPS_042026',
    invoicedDate: '04/01/2026',
    dueDate: '04/15/2026',
    glAccount: '50-2300-00',
    glDescription: 'Pool Maintenance — April 2026',
    amount: '$3,800.00',
    approversCount: 2,
    due: 'Due today',
    urgency: 'urgent',
    actionLabel: 'Approve',
    vendorInfo: { contact: 'Sandra Kim', email: 'contact@pacificpool.com', phone: '305.555.0187', website: 'www.pacificpoolsvc.com', address: '78 Blue Wave Dr, Miami, FL 33139', type: 'Pool Maintenance', recentPayments: 6, currentWOs: 1, woAll: 14, woOpen: 1, woInProgress: 1, woCompleted: 12, totalInvoices: 11, totalAmount: '$18,320.00' },
    approvers: [{ name: 'Sarah Mitchell', role: 'President', initials: 'SM', vote: 'approve', votedAt: 'Apr 2, 2026 · 9:14 AM' }, { name: 'David Chen', role: 'Vice President', initials: 'DC', vote: 'approve', votedAt: 'Apr 3, 2026 · 2:41 PM' }],
  },
  {
    id: 3,
    type: 'ACC',
    address: '214 Maple Dr',
    accType: 'Deck Installation',
    formReceived: '',
    toCommittee: '04/10/2026',
    response: '05/25/2026',
    autoApproval: '06/20/2026',
    autoApprovalUrgent: false,
    status: 'Open',
    logCount: 2,
    attachment: 'acc_deck_214.pdf',
    due: 'Decision due Apr 21',
    urgency: 'normal',
    actionLabel: 'Approve',
  },
  {
    id: 4,
    type: 'Invoice',
    title: 'Westside Plumbing',
    invoiceNum: 'WSP_041026',
    invoicedDate: '04/10/2026',
    dueDate: '04/22/2026',
    glAccount: '50-3100-00',
    glDescription: 'Emergency Repair — Clubhouse',
    amount: '$2,140.00',
    approversCount: 0,
    due: 'Due Apr 22',
    urgency: 'normal',
    actionLabel: 'Approve',
    vendorInfo: { contact: 'Tom Ramirez', email: 'support@westsideplumbing.com', phone: '305.555.0219', website: 'www.westsideplumbing.com', address: '315 West End Blvd, Miami, FL 33142', type: 'Plumbing', recentPayments: 3, currentWOs: 0, woAll: 5, woOpen: 0, woInProgress: 1, woCompleted: 4, totalInvoices: 3, totalAmount: '$4,890.00' },
    approvers: [],
  },
  {
    id: 5,
    type: 'ACC',
    address: '88 Oak Ln',
    accType: 'Solar Panel Installation',
    formReceived: '03/15/2026',
    toCommittee: '03/20/2026',
    response: '05/05/2026',
    autoApproval: '04/29/2026',
    autoApprovalUrgent: true,
    status: 'Open',
    logCount: 3,
    attachment: 'acc_solar_88.pdf',
    due: 'Decision due Apr 24',
    urgency: 'urgent',
    actionLabel: 'Approve',
  },
  {
    id: 6,
    type: 'Violation',
    violationType: 'Landscaping',
    acct: '2745369636951',
    address: '735 E Sierra Madre Ave',
    date: '04/02/2026',
    level: '3rd Notice - Fine Pending',
    fineStarts: '05/08/2026',
    description: 'Overgrown vegetation blocking sidewalk access and violating CC&R Section 4.2. Owner notified Feb 14, Mar 12, Apr 1 with no corrective action.',
    ownerName: 'Robert & Patricia Thompson',
    violationCount: 2,
    logCount: 4,
    attachment: 'img_735.png',
    due: 'Hearing May 8',
    urgency: 'urgent',
    actionLabel: 'Add Note',
  },
  {
    id: 7,
    type: 'WorkOrder',
    woNumber: '#4821',
    vendor: 'Green Valley Landscaping',
    created: '04/01/2026',
    printed: '04/01/2026',
    dueDate: '04/18/2026',
    urgency: 'urgent',
    status: 'New Work Order',
    location: 'Pool area — 12 Crestview Commons, near east gate',
    description: 'Repair irrigation system leak causing flooding on pool deck. Water pooling near east fence line — needs immediate assessment and fix.',
    logCount: 3,
    attachmentCount: 4,
    due: 'Due today',
    actionLabel: 'Mark Done',
  },
  {
    id: 8,
    type: 'Task',
    title: 'Approve Unit Ownership Record Change',
    dueDate: '04/24/2026',
    category: 'Collections',
    taskStatus: null,
    description: 'Review a submitted ownership record update. No sale has occurred, however, ownership is now held under a new LLC, and supporting documentation has been provided. Please review and advise.',
    attachment: 'Violations 2025-2026',
    acctInfo: 'Acct: 1588-4821  |  12346 Washington Avenue',
    logCount: 2,
    due: 'Due Apr 24',
    urgency: 'urgent',
    actionLabel: 'Complete',
  },
  {
    id: 9,
    type: 'Task',
    title: 'Review Violation Trend Analysis',
    dueDate: '04/24/2026',
    category: 'Collections',
    taskStatus: 'Not Started',
    description: 'Please review the attached report, which outlines recent patterns and recurring issues within the community. Please evaluate the findings and provide guidance on any actions, policy adjustments, or enforcement measures.',
    attachment: 'Violation analysis',
    acctInfo: null,
    logCount: 2,
    due: 'Due Apr 24',
    urgency: 'urgent',
    actionLabel: 'Complete',
  },
]

const TYPE_META = {
  Invoice:   { color: '#64a0ff', bg: 'rgba(100,160,255,0.18)', label: 'Invoice'      },
  ACC:       { color: '#ffb74d', bg: 'rgba(255,183,77,0.18)',  label: 'ACC Request'  },
  Violation: { color: '#e05c5c', bg: 'rgba(224,92,92,0.18)',   label: 'Violation'    },
  WorkOrder: { color: '#a78bfa', bg: 'rgba(167,139,250,0.18)', label: 'Work Order'   },
  Task:      { color: '#34d399', bg: 'rgba(52,211,153,0.18)',  label: 'Task'         },
}

const SWIPE_THRESHOLD = 80

export default function Tasks() {
  const [queue,      setQueue]      = useState(TASKS.map(t => t.id))
  const [doneIds,    setDoneIds]    = useState(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragX,      setDragX]      = useState(0)
  const [flyOff,     setFlyOff]     = useState(null)
  const [viewMode,   setViewMode]   = useState('card')   // 'card' | 'list'
  const [filterType, setFilterType] = useState(null)     // null | type string
  const [filterOpen, setFilterOpen] = useState(false)
  const [panel,      setPanel]      = useState(null)     // { type, task }

  const startXRef  = useRef(0)
  const dragXRef   = useRef(0)
  const cardRef    = useRef(null)
  const rafRef     = useRef(null)
  const filterRef  = useRef(null)

  // Close filter menu on outside click
  useEffect(() => {
    if (!filterOpen) return
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClick)
    return () => document.removeEventListener('pointerdown', handleClick)
  }, [filterOpen])

  const filteredQueue = filterType
    ? queue.filter(id => TASKS.find(t => t.id === id)?.type === filterType)
    : queue

  const queueCounts = queue.reduce((acc, id) => {
    const type = TASKS.find(t => t.id === id)?.type
    if (type) acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const pendingTasks = filteredQueue.map(id => TASKS.find(t => t.id === id)).filter(Boolean)
  const topTask      = pendingTasks[0]

  const { setActiveTask, setCephAIPulseCount } = useMode()

  // Signal CephAI whenever the top card changes
  useEffect(() => {
    if (topTask) {
      setActiveTask(topTask)
      setCephAIPulseCount(c => c + 1)
    }
  }, [topTask?.id])

  const approveOpacity = Math.max(0, Math.min(1, (dragX  - 30) / 60))
  const skipOpacity    = Math.max(0, Math.min(1, (-dragX - 30) / 60))

  function handlePointerDown(e) {
    startXRef.current = e.clientX
    dragXRef.current  = 0
    setIsDragging(true)
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e) {
    if (!isDragging) return
    if (rafRef.current) return
    const cx = e.clientX
    rafRef.current = requestAnimationFrame(() => {
      const dx = cx - startXRef.current
      dragXRef.current = dx
      setDragX(dx)
      rafRef.current = null
    })
  }

  function handlePointerUp() {
    setIsDragging(false)
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    const dx = dragXRef.current
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      flyCard(dx > 0 ? 'right' : 'left')
    } else {
      setDragX(0)
      dragXRef.current = 0
    }
  }

  function flyCard(dir) {
    setDragX(0)
    dragXRef.current = 0
    setFlyOff({ dir })
  }

  function handleTransitionEnd(e) {
    if (!flyOff || e.propertyName !== 'transform') return
    const [topId, ...rest] = queue
    if (flyOff.dir === 'right') {
      setDoneIds(prev => new Set([...prev, topId]))
      setQueue(rest)
    } else {
      setQueue([...rest, topId])
    }
    setFlyOff(null)
  }

  function getCardStyle(stackIdx) {
    const isTop = stackIdx === 0
    if (isTop) {
      if (flyOff) {
        const tx  = flyOff.dir === 'right' ? '150%' : '-150%'
        const rot = flyOff.dir === 'right' ? 22 : -22
        return { transform: `translateX(${tx}) rotate(${rot}deg)`, transition: 'transform 0.35s ease-in', zIndex: 10 }
      }
      return {
        transform:  `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        zIndex: 10,
      }
    }
    const scale  = 1 - stackIdx * 0.04
    const yShift = stackIdx * 6
    return {
      transform:  `scale(${scale}) translateY(${yShift}px)`,
      transition: 'transform 0.25s ease',
      zIndex:     10 - stackIdx,
    }
  }

  const skipLabel = topTask?.type === 'Invoice' ? 'Deny' : topTask?.type === 'Task' ? 'In Progress' : 'Skip'

  function openPanel(type, task) { setPanel({ type, task }) }
  function closePanel() { setPanel(null) }

  return (
    <div className="screen tasks-screen">
      <div className="tasks-layout">

        {/* Header */}
        <div className="tasks-header">
          <div>
            <h1 className="tasks-title">Board Action Items</h1>
            <p className="tasks-sub">
              {pendingTasks.length > 0
                ? `${pendingTasks.length} pending · ${doneIds.size} completed`
                : `All ${doneIds.size} tasks completed`}
            </p>
          </div>
          <div className="tasks-header-actions" ref={filterRef}>
            <button
              className={`tasks-header-btn${filterType ? ' tasks-header-btn--active' : ''}`}
              onClick={() => setFilterOpen(o => !o)}
            >
              <FilterIcon />
              {filterType && <span className="tasks-filter-dot" />}
            </button>
            {filterOpen && (
              <div className="tasks-filter-menu">
                <button
                  className={`tasks-filter-option${!filterType ? ' tasks-filter-option--active' : ''}`}
                  onClick={() => { setFilterType(null); setFilterOpen(false) }}
                >
                  All Types
                </button>
                {Object.entries(TYPE_META).map(([type, meta]) => (
                  <button
                    key={type}
                    className={`tasks-filter-option${filterType === type ? ' tasks-filter-option--active' : ''}`}
                    style={filterType === type ? { color: meta.color } : {}}
                    onClick={() => { setFilterType(type); setFilterOpen(false) }}
                  >
                    <span className="tasks-filter-option__dot" style={{ background: meta.color }} />
                    {meta.label}
                    {queueCounts[type] > 0 && (
                      <span className="tasks-filter-option__count">{queueCounts[type]}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card stack or list view or empty state */}
        {viewMode === 'list' ? (
          <TaskListView tasks={pendingTasks} doneIds={doneIds} />
        ) : pendingTasks.length > 0 ? (
          <div className="swipe-stack">
            {pendingTasks.slice(0, 3).map((task, stackIdx) => (
              <div
                key={task.id}
                ref={stackIdx === 0 ? cardRef : null}
                className="swipe-card"
                style={getCardStyle(stackIdx)}
                onPointerDown={stackIdx === 0 ? handlePointerDown : undefined}
                onPointerMove={stackIdx === 0 ? handlePointerMove : undefined}
                onPointerUp={stackIdx === 0 ? handlePointerUp   : undefined}
                onPointerCancel={stackIdx === 0 ? handlePointerUp : undefined}
                onTransitionEnd={stackIdx === 0 ? handleTransitionEnd : undefined}
              >
                {stackIdx === 0 && (
                  <>
                    <div className="swipe-label swipe-label--approve" style={{ opacity: approveOpacity }}>
                      <ApproveIcon /> {topTask?.actionLabel ?? 'Approve'}
                    </div>
                    <div className="swipe-label swipe-label--skip" style={{ opacity: skipOpacity }}>
                      {skipLabel} <SkipIcon />
                    </div>
                  </>
                )}
                {/* Type pill — top right corner */}
                {(() => {
                  const m = TYPE_META[task.type]
                  return m ? (
                    <span className="card-type-pill" style={{ color: '#111', background: m.color }}>
                      {m.label}
                    </span>
                  ) : null
                })()}
                <CardContent task={task} flyCard={stackIdx === 0 ? flyCard : null} flyOff={flyOff} onOpenPanel={openPanel} />
              </div>
            ))}
          </div>
        ) : (
          <div className="tasks-empty-state">
            <div className="tasks-empty-state__check"><CheckBigIcon /></div>
            <p className="tasks-empty-state__title">All caught up</p>
            <p className="tasks-empty-state__sub">You've reviewed all {doneIds.size} tasks</p>
          </div>
        )}

        {/* Position dots — card view only */}
        {viewMode === 'card' && pendingTasks.length > 0 && (
          <div className="tasks-progress">
            {(filterType ? TASKS.filter(t => t.type === filterType) : TASKS).map(t => {
              const isCurrent = t.id === topTask?.id
              const isDone    = doneIds.has(t.id)
              return (
                <div
                  key={t.id}
                  className={`tasks-progress__dot${isCurrent ? ' tasks-progress__dot--current' : isDone ? ' tasks-progress__dot--done' : ''}`}
                />
              )
            })}
          </div>
        )}

      </div>
      {panel?.type === 'vendor'         && <VendorInfoPanel    task={panel.task} onClose={closePanel} />}
      {panel?.type === 'invoice'        && <InvoicePDFPanel    task={panel.task} onClose={closePanel} />}
      {panel?.type === 'approvers'      && <ApproversPanel     task={panel.task} onClose={closePanel} />}
      {panel?.type === 'bank'           && <BankBalancePanel                     onClose={closePanel} />}
      {panel?.type === 'acc-log'        && <AccLogPanel        task={panel.task} onClose={closePanel} />}
      {panel?.type === 'acc-committee'  && <AccCommitteePanel  task={panel.task} onClose={closePanel} />}
      {panel?.type === 'acc-attachment' && <AccAttachmentPanel task={panel.task} onClose={closePanel} />}
      {panel?.type === 'acc-decision'   && <AccDecisionPanel   task={panel.task} onClose={closePanel} />}
    </div>
  )
}

/* ── Task list view ───────────────────────────────────── */
function TaskListView({ tasks }) {
  if (tasks.length === 0) {
    return (
      <div className="tasks-empty-state">
        <div className="tasks-empty-state__check"><CheckBigIcon /></div>
        <p className="tasks-empty-state__title">No tasks</p>
        <p className="tasks-empty-state__sub">Nothing matches the current filter</p>
      </div>
    )
  }

  return (
    <div className="task-list">
      {tasks.map(task => {
        const meta = TYPE_META[task.type]
        const isUrgent = task.urgency === 'urgent'
        let title = ''
        let subtitle = ''
        if (task.type === 'Invoice')   { title = task.title;         subtitle = `${task.invoiceNum} · ${task.amount}` }
        if (task.type === 'ACC')       { title = task.address;       subtitle = task.accType }
        if (task.type === 'Violation') { title = task.violationType; subtitle = task.address }
        if (task.type === 'WorkOrder') { title = task.woNumber;      subtitle = task.vendor }

        return (
          <div key={task.id} className="task-list-row">
            <span
              className="task-list-row__pill"
              style={{ color: meta.color, background: meta.bg }}
            >
              {meta.label}
            </span>
            <div className="task-list-row__info">
              <span className="task-list-row__title">{title}</span>
              {subtitle && <span className="task-list-row__sub">{subtitle}</span>}
            </div>
            <span className={`task-list-row__due${isUrgent ? ' task-list-row__due--urgent' : ''}`}>
              {task.due}
            </span>
            <ChevronRowIcon />
          </div>
        )
      })}
    </div>
  )
}

/* ── Card hero image ──────────────────────────────────── */
function CardHero({ type }) {
  const illus = TYPE_ILLUSTRATIONS[type]
  if (!illus) return null
  return (
    <div className="card-hero">
      <img src={illus.src} className="card-hero__img" alt="" />
    </div>
  )
}

/* ── Card dispatcher ──────────────────────────────────── */
function CardContent({ task, flyCard, flyOff, onOpenPanel }) {
  if (task.type === 'Invoice')   return <InvoiceCardContent   task={task} flyCard={flyCard} flyOff={flyOff} onOpenPanel={onOpenPanel} />
  if (task.type === 'WorkOrder') return <WorkOrderCardContent task={task} flyCard={flyCard} flyOff={flyOff} />
  if (task.type === 'Violation') return <ViolationCardContent task={task} />
  if (task.type === 'ACC')       return <ACCCardContent       task={task} onOpenPanel={onOpenPanel} />
  if (task.type === 'Task')      return <TaskCardContent      task={task} flyCard={flyCard} flyOff={flyOff} />
  return null
}

/* ── Invoice card ─────────────────────────────────────── */
function InvoiceCardContent({ task, flyCard, flyOff, onOpenPanel }) {
  function stopDrag(e) { e.stopPropagation() }

  return (
    <div className="card-body invoice-body">
      <div className="inv-scroll">
        <CardHero type="Invoice" />

        {/* Vendor header */}
        <div className="inv-vendor">
          <img src={VendorSvg} className="inv-vendor__icon" alt="" />
          <span className="inv-vendor__name">{task.title}</span>
        </div>

        {/* Key-value fields */}
        <div className="inv-fields">
          <div className="inv-field">
            <span className="inv-field__label">Invoice #:</span>
            <span className="inv-field__value">{task.invoiceNum}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Invoiced:</span>
            <span className="inv-field__value">{task.invoicedDate}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Due:</span>
            <span className={`inv-field__value${task.urgency === 'urgent' ? ' inv-field__value--urgent' : ''}`}>
              {task.dueDate}
            </span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">GL Account:</span>
            <span className="inv-field__value">{task.glAccount}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Description:</span>
            <span className="inv-field__value">{task.glDescription}</span>
          </div>
        </div>

        {/* Info rows */}
        <div className="inv-rows">
          <button className="inv-row" onPointerDown={stopDrag} onClick={() => onOpenPanel?.('vendor', task)}>
            <span className="inv-row__icon"><img src={VendorSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">{task.title}</span>
              <span className="inv-row__sub">Vendor Info</span>
            </span>
            <ChevronRowIcon />
          </button>

          <button className="inv-row" onPointerDown={stopDrag} onClick={() => onOpenPanel?.('invoice', task)}>
            <span className="inv-row__icon"><img src={AttachSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Invoice</span>
            </span>
            <ChevronRowIcon />
          </button>

          <button className="inv-row" onPointerDown={stopDrag} onClick={() => onOpenPanel?.('approvers', task)}>
            <span className="inv-row__icon"><img src={ThumbsUpSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Previous Approvers</span>
            </span>
            {task.approversCount > 0 && (
              <span className="inv-row__badge">{task.approversCount}</span>
            )}
            <ChevronRowIcon />
          </button>

          <button className="inv-row inv-row--last" onPointerDown={stopDrag} onClick={() => onOpenPanel?.('bank', task)}>
            <span className="inv-row__icon"><img src={BankSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Bank Balance</span>
            </span>
            <ChevronRowIcon />
          </button>
        </div>

      </div>

      {/* Amount — pinned above buttons */}
      <div className="inv-amount-row">
        <span className="inv-amount-label">Invoice Amount</span>
        <span className="inv-amount">{task.amount}</span>
      </div>

      {/* Decision buttons — pinned at bottom */}
      <div className="inv-actions" onPointerDown={stopDrag}>
        <button
          className="inv-btn inv-btn--deny"
          onClick={() => flyCard && !flyOff && flyCard('left')}
        >
          <SkipIcon />
          <span>Deny</span>
        </button>
        <button
          className="inv-btn inv-btn--approve"
          onClick={() => flyCard && !flyOff && flyCard('right')}
        >
          <span>Approve</span>
          <ApproveIcon />
        </button>
      </div>
    </div>
  )
}

/* ── Work Order card ──────────────────────────────────── */
function WorkOrderCardContent({ task, flyCard, flyOff }) {
  function stopDrag(e) { e.stopPropagation() }

  return (
    <div className="card-body invoice-body">
      <div className="inv-scroll">
        <CardHero type="WorkOrder" />

        {/* WO header */}
        <div className="inv-vendor">
          <img src={WoSvg} className="inv-vendor__icon" alt="" />
          <span className="inv-vendor__name">{task.woNumber}</span>
        </div>

        {/* Key-value fields */}
        <div className="inv-fields">
          <div className="inv-field">
            <span className="inv-field__label">Created:</span>
            <span className="inv-field__value">{task.created}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Printed / Emailed:</span>
            <span className="inv-field__value">{task.printed}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Due:</span>
            <span className={`inv-field__value${task.urgency === 'urgent' ? ' inv-field__value--urgent' : ''}`}>
              {task.dueDate}
            </span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Status:</span>
            <span className="inv-field__value">{task.status}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Location:</span>
            <span className="inv-field__value">{task.location}</span>
          </div>
          <div className="inv-field wo-description">
            {task.description}
          </div>
        </div>

        {/* Info rows */}
        <div className="inv-rows">
          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={VendorSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">{task.vendor}</span>
              <span className="inv-row__sub">Vendor</span>
            </span>
            <ChevronRowIcon />
          </button>

          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={LogSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Log &amp; Notes</span>
            </span>
            {task.logCount > 0 && (
              <span className="inv-row__badge">{task.logCount}</span>
            )}
            <ChevronRowIcon />
          </button>

          <button className="inv-row inv-row--last" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={AttachSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Attachments ({task.attachmentCount})</span>
            </span>
            <ChevronRowIcon />
          </button>
        </div>

      </div>

      {/* Action button — pinned at bottom */}
      <div className="wo-actions" onPointerDown={stopDrag}>
        <button className="wo-btn">Add Note</button>
      </div>
    </div>
  )
}

/* ── Violation card ───────────────────────────────────── */
function ViolationCardContent({ task }) {
  function stopDrag(e) { e.stopPropagation() }
  const initials = task.ownerName.split(' ').slice(0, 2).map(w => w[0]).join('')

  return (
    <div className="card-body invoice-body">
      <div className="inv-scroll">
        <CardHero type="Violation" />

        {/* Header */}
        <div className="inv-vendor">
          <AlertIcon />
          <span className="inv-vendor__name viol-type">{task.violationType}</span>
        </div>

        {/* Key-value fields */}
        <div className="inv-fields">
          <div className="inv-field">
            <span className="inv-field__label">Acct:</span>
            <span className="inv-field__value">{task.acct}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label inv-field__label--hidden" />
            <span className="inv-field__value viol-address">{task.address}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Date:</span>
            <span className="inv-field__value">{task.date}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Level:</span>
            <span className="inv-field__value">{task.level}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Fine Starts:</span>
            <span className={`inv-field__value${task.urgency === 'urgent' ? ' inv-field__value--urgent' : ''}`}>{task.fineStarts}</span>
          </div>
          <div className="inv-field wo-description">{task.description}</div>
        </div>

        {/* Info rows */}
        <div className="inv-rows">
          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon viol-avatar">{initials}</span>
            <span className="inv-row__content">
              <span className="inv-row__title">{task.ownerName}</span>
              <span className="inv-row__sub">Home Owner</span>
            </span>
            <ChevronRowIcon />
          </button>

          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon">
              <img src={ChecklistSvg} className="inv-row__svg inv-row__svg--invert" alt="" />
            </span>
            <span className="inv-row__content">
              <span className="inv-row__title">Violation Items ({task.violationCount})</span>
            </span>
            <ChevronRowIcon />
          </button>

          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={LogSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Log &amp; Notes</span>
            </span>
            {task.logCount > 0 && <span className="inv-row__badge">{task.logCount}</span>}
            <ChevronRowIcon />
          </button>

          <button className="inv-row inv-row--last" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={AttachSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">{task.attachment}</span>
            </span>
            <ChevronRowIcon />
          </button>
        </div>

      </div>

      {/* Action buttons — pinned at bottom */}
      <div className="viol-actions" onPointerDown={stopDrag}>
        <button className="viol-btn viol-btn--comment">Add Comment</button>
        <button className="viol-btn viol-btn--note">Add Board Note</button>
      </div>
    </div>
  )
}

/* ── ACC Request card ─────────────────────────────────── */
function ACCCardContent({ task, onOpenPanel }) {
  function stopDrag(e) { e.stopPropagation() }

  return (
    <div className="card-body invoice-body">
      <div className="inv-scroll">
        <CardHero type="ACC" />

        {/* Address header */}
        <div className="inv-vendor">
          <span className="inv-vendor__name acc-address">{task.address}</span>
        </div>

        {/* Key-value fields */}
        <div className="inv-fields">
          <div className="inv-field">
            <span className="inv-field__label">Type:</span>
            <span className="inv-field__value">{task.accType}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Form Received:</span>
            <span className="inv-field__value">{task.formReceived || '—'}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">To Committee:</span>
            <span className="inv-field__value">{task.toCommittee}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Response:</span>
            <span className="inv-field__value">{task.response}</span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Auto Approval:</span>
            <span className={`inv-field__value${task.autoApprovalUrgent ? ' inv-field__value--urgent' : ''}`}>
              {task.autoApproval}
            </span>
          </div>
          <div className="inv-field">
            <span className="inv-field__label">Status:</span>
            <span className="inv-field__value">{task.status}</span>
          </div>
        </div>

        {/* Info rows */}
        <div className="inv-rows">
          <button className="inv-row" onPointerDown={stopDrag} onClick={() => onOpenPanel?.('acc-log', task)}>
            <span className="inv-row__icon"><img src={LogSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Log &amp; Notes</span>
            </span>
            {task.logCount > 0 && <span className="inv-row__badge">{task.logCount}</span>}
            <ChevronRowIcon />
          </button>

          <button className="inv-row" onPointerDown={stopDrag} onClick={() => onOpenPanel?.('acc-committee', task)}>
            <span className="inv-row__icon"><img src={ChatSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Committee</span>
            </span>
            <ChevronRowIcon />
          </button>

          <button className="inv-row inv-row--last" onPointerDown={stopDrag} onClick={() => onOpenPanel?.('acc-attachment', task)}>
            <span className="inv-row__icon"><img src={AttachSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">{task.attachment}</span>
            </span>
            <ChevronRowIcon />
          </button>
        </div>

      </div>

      {/* Action buttons — pinned at bottom */}
      <div className="acc-actions" onPointerDown={stopDrag}>
        <button className="acc-btn acc-btn--decision" onClick={() => onOpenPanel?.('acc-decision', task)}>Add Decision</button>
      </div>
    </div>
  )
}

/* ── Task card ────────────────────────────────────────── */
function TaskCardContent({ task, flyCard, flyOff }) {
  function stopDrag(e) { e.stopPropagation() }

  return (
    <div className="card-body invoice-body">
      <div className="inv-scroll">
        <CardHero type="Task" />

        {/* Meta fields */}
        <div className="task-meta">
          <div className="task-meta__row">
            <span className="task-meta__label">Due Date:</span>
            <span className={`task-meta__value${task.urgency === 'urgent' ? ' task-meta__value--urgent' : ''}`}>{task.dueDate}</span>
          </div>
          <div className="task-meta__row">
            <span className="task-meta__label">Category:</span>
            <span className="task-meta__value">{task.category}</span>
          </div>
          {task.taskStatus && (
            <div className="task-meta__row">
              <span className="task-meta__label">Status:</span>
              <span className="task-meta__value">{task.taskStatus}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <p className="task-card__title">{task.title}</p>

        {/* Description */}
        <p className="task-card__desc">{task.description}</p>

        {/* Info rows */}
        <div className="inv-rows">
          {task.attachment && (
            <button className="inv-row" onPointerDown={stopDrag}>
              <span className="inv-row__icon"><img src={AttachSvg} className="inv-row__svg" alt="" /></span>
              <span className="inv-row__content">
                <span className="inv-row__title">{task.attachment}</span>
              </span>
              <ChevronRowIcon />
            </button>
          )}
          {task.acctInfo && (
            <button className="inv-row" onPointerDown={stopDrag}>
              <span className="inv-row__icon"><img src={BankSvg} className="inv-row__svg" alt="" /></span>
              <span className="inv-row__content">
                <span className="inv-row__title">Account Info</span>
                <span className="inv-row__sub task-acct-info">{task.acctInfo}</span>
              </span>
              <ChevronRowIcon />
            </button>
          )}
          <button className="inv-row inv-row--last" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={LogSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Log &amp; Messages</span>
            </span>
            {task.logCount > 0 && <span className="inv-row__badge">{task.logCount}</span>}
            <ChevronRowIcon />
          </button>
        </div>

      </div>

      {/* Action buttons */}
      <div className="task-actions" onPointerDown={stopDrag}>
        <button
          className="task-btn task-btn--progress"
          onClick={() => flyCard && !flyOff && flyCard('left')}
        >
          In Progress
        </button>
        <button
          className="task-btn task-btn--complete"
          onClick={() => flyCard && !flyOff && flyCard('right')}
        >
          Completed
        </button>
      </div>
    </div>
  )
}

/* ── Shared panel header ──────────────────────────────── */
function PanelHeader({ title, hideTitle, onClose }) {
  const { isBoard, setIsBoard } = useMode()
  const navigate = useNavigate()
  return (
    <header className="app-header inv-panel__appheader">
      <div className="app-header__inner">
        <div className="app-header__left">
          <button className="app-header__back" onClick={onClose} aria-label="Back">
            <PanelBackIcon />
          </button>
          {!hideTitle && (
            <div className="app-header__hoa">
              <span className="app-header__hoa-name">{title}</span>
            </div>
          )}
        </div>
        <div className="app-header__right">
          <button
            className={`mode-toggle ${isBoard ? 'mode-toggle--board' : 'mode-toggle--resident'}`}
            onClick={() => { if (isBoard) navigate('/'); setIsBoard(b => !b) }}
            aria-label="Switch mode"
          >
            <div className="mode-toggle__thumb" />
            <div className="mode-toggle__icon">
              {isBoard ? <PanelBoardIcon /> : <PanelUserIcon />}
            </div>
          </button>
          <button className="notif-btn" aria-label="Notifications">
            <PanelBellIcon />
            <span className="notif-btn__badge">5</span>
          </button>
        </div>
      </div>
      <div className="app-header__divider" />
    </header>
  )
}

/* ── Vendor Info panel ────────────────────────────────── */
function VendorInfoPanel({ task, onClose }) {
  const v = task.vendorInfo || {}
  return (
    <div className="inv-panel">
      <PanelHeader title="Vendor Info" hideTitle onClose={onClose} />
      <div className="inv-panel__body">
        <h2 className="inv-panel__page-title">Vendor Info</h2>

        {/* Vendor card */}
        <div className="vend-card">
          <div className="vend-name-row">
            <img src={VendorSvg} className="vend-name-row__icon" alt="" />
            <span className="vend-name-row__name">{task.title}</span>
          </div>
          <div className="vend-fields">
            {[
              ['Contact Name', v.contact],
              ['Email',        v.email],
              ['Phone Number', v.phone],
              ['Website',      v.website],
              ['Address',      v.address],
              ['Type',         v.type],
            ].map(([label, value]) => (
              <div key={label} className="vend-field">
                <span className="vend-field__label">{label}:</span>
                <span className="vend-field__value">{value}</span>
              </div>
            ))}
          </div>
          <div className="vend-card__divider" />
          <div className="vend-links">
            <button className="vend-link">
              <span className="vend-link__icon"><img src={AttachSvg} className="inv-row__svg" alt="" /></span>
              <span>Recent Vendor Payments</span>
              <ChevronRowIcon />
            </button>
            <button className="vend-link vend-link--last">
              <span className="vend-link__icon"><img src={WoSvg} className="inv-row__svg" alt="" /></span>
              <span>Current Work Orders ({v.currentWOs ?? 0})</span>
              <ChevronRowIcon />
            </button>
          </div>
        </div>

        {/* Work Orders Summary */}
        <p className="vend-section-title">Work Orders Summary</p>
        <div className="vend-wo-grid">
          {[
            { label: 'All',         value: v.woAll,         icon: <WoAllIcon /> },
            { label: 'Open',        value: v.woOpen,        icon: <WoOpenIcon /> },
            { label: 'In Progress', value: v.woInProgress,  icon: <WoProgressIcon /> },
            { label: 'Completed',   value: v.woCompleted,   icon: <WoCompletedIcon /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="vend-wo-cell">
              <div className="vend-wo-cell__top">
                <span className="vend-wo-cell__icon">{icon}</span>
                <span className="vend-wo-cell__count">{value}</span>
              </div>
              <span className="vend-wo-cell__label">{label}</span>
            </div>
          ))}
        </div>

        {/* Total Paid Invoices */}
        <p className="vend-section-title">Total Paid Invoices</p>
        <div className="vend-invoice-card">
          <div className="vend-invoice-card__top">
            <img src={AttachSvg} className="vend-invoice-card__icon" alt="" />
            <span className="vend-invoice-card__count">{v.totalInvoices}</span>
          </div>
          <div className="vend-invoice-card__bottom">
            <span className="vend-invoice-card__label">Last 6 Months</span>
            <span className="vend-invoice-card__amount">{v.totalAmount}</span>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Invoice PDF panel ────────────────────────────────── */
function InvoicePDFPanel({ task, onClose }) {
  const v = task.vendorInfo || {}
  return (
    <div className="inv-panel">
      <PanelHeader title="Invoice" hideTitle onClose={onClose} />
      <div className="inv-panel__body inv-panel__body--pdf">
        <h2 className="inv-panel__page-title">Invoice</h2>
        <div className="pdf-doc">
          <div className="pdf-header">
            <div>
              <p className="pdf-from">{task.title}</p>
              {v.address && <p className="pdf-address">{v.address}</p>}
              {v.contact && <p className="pdf-contact">{v.contact}</p>}
              {v.email   && <p className="pdf-email">{v.email}</p>}
            </div>
            <div className="pdf-badge">INVOICE</div>
          </div>
          <div className="pdf-divider" />
          <div className="pdf-meta">
            <div><span className="pdf-meta__label">Invoice #</span><span className="pdf-meta__val">{task.invoiceNum}</span></div>
            <div><span className="pdf-meta__label">Date</span><span className="pdf-meta__val">{task.invoicedDate}</span></div>
            <div><span className="pdf-meta__label">Due Date</span><span className="pdf-meta__val">{task.dueDate}</span></div>
          </div>
          <div className="pdf-divider" />
          <div className="pdf-bill-to">
            <p className="pdf-bill-to__label">BILL TO</p>
            <p className="pdf-bill-to__name">Cardinal Hills HOA</p>
            <p className="pdf-bill-to__addr">1200 Cardinal Dr, Miami, FL 33130</p>
          </div>
          <div className="pdf-divider" />
          <div className="pdf-table">
            <div className="pdf-table__head"><span>Description</span><span>Amount</span></div>
            <div className="pdf-table__row"><span>{task.glDescription}</span><span>{task.amount}</span></div>
            <div className="pdf-table__row"><span className="pdf-table__gl">GL: {task.glAccount}</span><span /></div>
          </div>
          <div className="pdf-divider" />
          <div className="pdf-total">
            <span>TOTAL DUE</span>
            <span className="pdf-total__amount">{task.amount}</span>
          </div>
          <div className="pdf-footer">
            <p>Thank you for your business.</p>
            {v.website && <p>{v.website}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Approvers panel ──────────────────────────────────── */
const ALL_BOARD_MEMBERS = [
  { name: 'Sarah Mitchell', role: 'President',      initials: 'SM' },
  { name: 'David Chen',     role: 'Vice President', initials: 'DC' },
  { name: 'Lisa Thompson',  role: 'Treasurer',      initials: 'LT' },
  { name: 'John Parker',    role: 'Secretary',      initials: 'JP' },
  { name: 'Maria Garcia',   role: 'Director',       initials: 'MG' },
]

function ApproversPanel({ task, onClose }) {
  const approvedMap = Object.fromEntries((task.approvers || []).map(a => [a.name, a]))
  const members = ALL_BOARD_MEMBERS.map(m => ({ ...m, ...(approvedMap[m.name] ?? { vote: 'pending' }) }))
  return (
    <div className="inv-panel">
      <PanelHeader title="Previous Approvers" hideTitle onClose={onClose} />
      <div className="inv-panel__body">
        <h2 className="inv-panel__page-title">Previous Approvers</h2>
        <p className="approvers-sub">{task.approversCount} of {ALL_BOARD_MEMBERS.length} board members voted</p>
        <div className="approvers-list">
          {members.map(m => (
            <div key={m.name} className="approver-row">
              <div className="approver-avatar">{m.initials}</div>
              <div className="approver-info">
                <span className="approver-name">{m.name}</span>
                <span className="approver-role">{m.role}</span>
                {m.votedAt && <span className="approver-date">{m.votedAt}</span>}
              </div>
              <div className={`approver-vote approver-vote--${m.vote}`}>
                {m.vote === 'approve' ? <ThumbsUpVoteIcon /> : m.vote === 'deny' ? <ThumbsDownVoteIcon /> : <PendingVoteIcon />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Bank Balance panel ───────────────────────────────── */
const PANEL_BANK_ACCOUNTS = [
  { name: 'Depository Account', balance: 284620, registered: 261480 },
  { name: 'Reserves Account',   balance: 512340, registered: 512340 },
]
const PANEL_RESERVE = { funded: 512340, target: 607000, pct: 84, qoqDelta: 2.4 }
function fmtBank(n) { return '$' + Math.abs(n).toLocaleString() }

function BankBalancePanel({ onClose }) {
  const [bankTab, setBankTab] = useState('balance')
  return (
    <div className="inv-panel">
      <PanelHeader title="Bank Balance" hideTitle onClose={onClose} />
      <div className="inv-panel__body">
        <h2 className="inv-panel__page-title">Bank Balance</h2>
        <div className="viol-tabs" style={{ marginBottom: 16 }}>
          {[['balance', 'Balance'], ['reserve', 'Reserve Fund']].map(([key, label]) => (
            <button key={key} className={`viol-tab${bankTab === key ? ' viol-tab--active' : ''}`} onClick={() => setBankTab(key)}>{label}</button>
          ))}
        </div>
        {bankTab === 'balance' && <>
          <div className="bank-card__header"><span className="bank-card__all-label">All Accounts</span></div>
          <p className="bank-card__total">{fmtBank(PANEL_BANK_ACCOUNTS.reduce((s, a) => s + a.balance, 0))}</p>
          <div className="bank-accounts">
            {PANEL_BANK_ACCOUNTS.map((acct, i) => {
              const hasPending = acct.registered !== acct.balance
              const diff = acct.registered - acct.balance
              return (
                <div key={acct.name} className={`bank-account${i < PANEL_BANK_ACCOUNTS.length - 1 ? ' bank-account--border' : ''}`}>
                  <div className="bank-account__left">
                    <span className="bank-account__name">{acct.name}</span>
                    {hasPending && <span className={`bank-account__pending ${diff < 0 ? 'bank-account__pending--debit' : 'bank-account__pending--credit'}`}>{diff < 0 ? '↓' : '↑'} {fmtBank(Math.abs(diff))} pending</span>}
                  </div>
                  <div className="bank-account__right">
                    <span className="bank-account__balance">{fmtBank(acct.balance)}</span>
                    <span className="bank-account__reg-row"><span className="bank-account__reg-label">Registered</span><span className="bank-account__reg-val">{fmtBank(acct.registered)}</span></span>
                  </div>
                </div>
              )
            })}
          </div>
        </>}
        {bankTab === 'reserve' && (
          <div className="reserve-body" style={{ height: 'auto' }}>
            <div className="reserve-hero">
              <p className="reserve-pct"><span className="reserve-pct__num">{PANEL_RESERVE.pct}</span><span className="reserve-pct__unit">%</span></p>
              <span className="reserve-qoq">↗ +{PANEL_RESERVE.qoqDelta}pp QoQ</span>
            </div>
            <div className="reserve-bottom" style={{ marginTop: 24 }}>
              <div className="reserve-bar">
                <div className="reserve-bar__fill" style={{ width: `${PANEL_RESERVE.pct}%` }} />
                <div className="reserve-bar__tick" style={{ left: '33%' }} />
                <div className="reserve-bar__tick" style={{ left: '66%' }} />
              </div>
              <div className="reserve-labels">
                <span className="reserve-labels__funded">{fmtBank(PANEL_RESERVE.funded)}<span className="reserve-labels__word"> funded</span></span>
                <span className="reserve-labels__target">target <strong>{fmtBank(PANEL_RESERVE.target)}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── ACC Log & Notes panel ────────────────────────────── */
const ACC_LOG_MESSAGES = {
  3: [
    { id: 1, from: 'homeowner', name: 'Alex Rivera',  avatar: '/images/avatar-1.jpg', time: 'Mar 28 \u00b7 10:02 AM', text: "Hi, I've submitted my deck installation application along with the site plan and material specs. Please let me know if anything else is needed." },
    { id: 2, from: 'committee', name: 'Committee',    avatar: '/images/cinc-icon.png', time: 'Apr 2 \u00b7 9:18 AM',   text: "Thank you for your submission! We've received all documents. Your request has been forwarded to the full committee and will be reviewed at the April 10th meeting." },
    { id: 3, from: 'homeowner', name: 'Alex Rivera',  avatar: '/images/avatar-1.jpg', time: 'Apr 12 \u00b7 3:45 PM',  text: 'Just checking in \u2014 any update after the April 10th meeting?' },
    { id: 4, from: 'committee', name: 'Committee',    avatar: '/images/cinc-icon.png', time: 'Apr 14 \u00b7 11:30 AM', text: "The committee reviewed your application. We'd like clarification on the composite decking material. Could you provide the manufacturer's spec sheet and color sample?" },
  ],
  5: [
    { id: 1, from: 'homeowner', name: 'Jordan Kim',   avatar: '/images/avatar-3.jpg', time: 'Mar 15 \u00b7 2:10 PM',  text: "I've submitted the solar panel application with the full engineering drawings and HOA assessment report as requested. All panels will be flush-mounted, not visible from the street." },
    { id: 2, from: 'committee', name: 'Committee',    avatar: '/images/cinc-icon.png', time: 'Mar 20 \u00b7 10:05 AM', text: "Thank you Jordan. Application received and forwarded to the committee. We'll confirm within the standard 45-day review window." },
    { id: 3, from: 'homeowner', name: 'Jordan Kim',   avatar: '/images/avatar-3.jpg', time: 'Apr 5 \u00b7 8:55 AM',   text: 'The installer is ready to schedule. Is there an estimated decision date?' },
    { id: 4, from: 'committee', name: 'Committee',    avatar: '/images/cinc-icon.png', time: 'Apr 8 \u00b7 4:00 PM',  text: "We're targeting a decision by April 24. The main question is roof penetration \u2014 please have your contractor confirm the waterproofing method in writing." },
    { id: 5, from: 'homeowner', name: 'Jordan Kim',   avatar: '/images/avatar-3.jpg', time: 'Apr 10 \u00b7 9:22 AM', text: "Attached the contractor's waterproofing statement. Let me know if you need anything else." },
  ],
}

const ACC_COMMITTEE_MESSAGES = {
  3: [
    { id: 1, name: 'Sarah Mitchell',  role: 'President',      avatar: '/images/avatar-2.jpg',      time: 'Apr 10 \u00b7 6:05 PM', text: 'I reviewed the site plan. Deck footprint is well within setback limits. Structure looks solid.' },
    { id: 2, name: 'David Chen',      role: 'Vice President', avatar: '/images/avatar-4.jpg',      time: 'Apr 10 \u00b7 6:22 PM', text: "Agreed on setbacks. My concern is the material \u2014 the color swatch in the application is hard to read. I'd like a proper spec sheet before we vote." },
    { id: 3, name: 'Lisa Thompson',   role: 'Treasurer',      avatar: '/images/avatar-linkedin.jpg', time: 'Apr 11 \u00b7 8:40 AM', text: "Concur with David. Let's hold approval pending the spec sheet. We can vote at the next meeting once we have it." },
    { id: 4, name: 'John Parker',     role: 'Secretary',      avatar: '/images/avatar-1.jpg',      time: 'Apr 11 \u00b7 9:15 AM', text: "Makes sense. I'll draft the clarification request to the homeowner today." },
  ],
  5: [
    { id: 1, name: 'Maria Garcia',    role: 'Director',       avatar: '/images/avatar-3.jpg',      time: 'Mar 21 \u00b7 3:10 PM', text: 'Solar application looks comprehensive. Engineering drawings are well done. Flush-mounted so street visibility is a non-issue.' },
    { id: 2, name: 'Sarah Mitchell',  role: 'President',      avatar: '/images/avatar-2.jpg',      time: 'Mar 21 \u00b7 3:45 PM', text: "Agree. My only flag is the roof penetration method \u2014 we've had leaks in this HOA before. Need contractor waterproofing confirmation before we approve." },
    { id: 3, name: 'David Chen',      role: 'Vice President', avatar: '/images/avatar-4.jpg',      time: 'Mar 22 \u00b7 10:00 AM', text: "That's fair. Auto-approval deadline is Apr 29 so we have time. Let's request it." },
    { id: 4, name: 'Lisa Thompson',   role: 'Treasurer',      avatar: '/images/avatar-linkedin.jpg', time: 'Apr 10 \u00b7 2:15 PM', text: "Waterproofing statement just came in \u2014 looks good. TPO membrane, fully bonded. I'm comfortable approving once JP confirms the doc is complete." },
    { id: 5, name: 'John Parker',     role: 'Secretary',      avatar: '/images/avatar-1.jpg',      time: 'Apr 10 \u00b7 4:30 PM', text: 'Reviewed. Doc is complete and meets our standards. Ready to vote.' },
  ],
}

function AccLogPanel({ task, onClose }) {
  const messages = ACC_LOG_MESSAGES[task.id] || []
  const [draft, setDraft] = useState('')
  return (
    <div className="inv-panel">
      <PanelHeader title="Log & Notes" hideTitle onClose={onClose} />
      <div className="inv-panel__body acc-chat-body">
        <h2 className="inv-panel__page-title">Log &amp; Notes</h2>
        <p className="acc-chat-meta">{task.address} · {task.accType}</p>
        <div className="acc-chat-log">
          {messages.map(msg => (
            <div key={msg.id} className={`acc-bubble-row acc-bubble-row--${msg.from}`}>
              {msg.from !== 'homeowner' && (
                <img className="acc-bubble-avatar" src={msg.avatar} alt={msg.name} />
              )}
              <div className="acc-bubble-wrap">
                <span className="acc-bubble-name">{msg.name} · {msg.time}</span>
                <div className={`acc-bubble acc-bubble--${msg.from}`}>{msg.text}</div>
              </div>
              {msg.from === 'homeowner' && (
                <img className="acc-bubble-avatar" src={msg.avatar} alt={msg.name} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="acc-chat-input">
        <input
          className="acc-chat-input__field"
          placeholder="Add a note…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
        <button className="acc-chat-input__send" disabled={!draft.trim()} aria-label="Send">
          <SendIcon />
        </button>
      </div>
    </div>
  )
}

/* ── ACC Committee panel ──────────────────────────────── */
function AccCommitteePanel({ task, onClose }) {
  const messages = ACC_COMMITTEE_MESSAGES[task.id] || []
  const [draft, setDraft] = useState('')
  return (
    <div className="inv-panel">
      <PanelHeader title="Committee" hideTitle onClose={onClose} />
      <div className="inv-panel__body acc-chat-body">
        <h2 className="inv-panel__page-title">Committee</h2>
        <div className="acc-committee-badge">
          <LockIcon />
          <span>Private — not visible to homeowner</span>
        </div>
        <p className="acc-chat-meta">{task.address} · {task.accType}</p>
        <div className="acc-chat-log">
          {messages.map(msg => (
            <div key={msg.id} className="acc-bubble-row acc-bubble-row--committee">
              <img className="acc-bubble-avatar" src={msg.avatar} alt={msg.name} />
              <div className="acc-bubble-wrap">
                <span className="acc-bubble-name">{msg.name} · <span className="acc-bubble-role">{msg.role}</span> · {msg.time}</span>
                <div className="acc-bubble acc-bubble--committee">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="acc-chat-input">
        <input
          className="acc-chat-input__field"
          placeholder="Add a comment…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
        <button className="acc-chat-input__send" disabled={!draft.trim()} aria-label="Send">
          <SendIcon />
        </button>
      </div>
    </div>
  )
}

/* ── ACC Attachment panel ─────────────────────────────── */
function AccAttachmentPanel({ task, onClose }) {
  const isDeck = task.id === 3
  return (
    <div className="inv-panel">
      <PanelHeader title="Attachment" hideTitle onClose={onClose} />
      <div className="inv-panel__body inv-panel__body--pdf">
        <h2 className="inv-panel__page-title">Attachment</h2>

        {/* Page 1 — Application */}
        <div className="pdf-doc acc-pdf-doc">
          <div className="acc-pdf-header">
            <div className="acc-pdf-logo">Cardinal Hills HOA</div>
            <div className="acc-pdf-title">Architectural Change Request</div>
            <div className="acc-pdf-sub">Application Form · {task.attachment}</div>
          </div>
          <div className="pdf-divider" />
          <div className="acc-pdf-section">
            <p className="acc-pdf-label">HOMEOWNER INFORMATION</p>
            <div className="acc-pdf-row"><span>Owner</span><span>{isDeck ? 'Alex Rivera' : 'Jordan Kim'}</span></div>
            <div className="acc-pdf-row"><span>Property</span><span>{task.address}, Miami, FL 33130</span></div>
            <div className="acc-pdf-row"><span>Phone</span><span>{isDeck ? '305.555.0198' : '305.555.0234'}</span></div>
            <div className="acc-pdf-row"><span>Email</span><span>{isDeck ? 'a.rivera@email.com' : 'j.kim@email.com'}</span></div>
          </div>
          <div className="pdf-divider" />
          <div className="acc-pdf-section">
            <p className="acc-pdf-label">PROJECT DESCRIPTION</p>
            <div className="acc-pdf-row"><span>Type</span><span>{task.accType}</span></div>
            <div className="acc-pdf-row"><span>Est. Start</span><span>{isDeck ? 'May 10, 2026' : 'May 5, 2026'}</span></div>
            <div className="acc-pdf-row"><span>Est. Complete</span><span>{isDeck ? 'Jun 14, 2026' : 'Jun 1, 2026'}</span></div>
            <div className="acc-pdf-row"><span>Contractor</span><span>{isDeck ? 'Sunrise Deck Co.' : 'SolarBright LLC'}</span></div>
            <p className="acc-pdf-desc">
              {isDeck
                ? 'Proposed installation of a 12×16 ft composite deck off the rear sliding door, pressure-treated frame, Trex Transcend composite boards in Tiki Torch color. Footings per local code.'
                : 'Roof-mounted photovoltaic system, 18 panels (400W each), flush-mounted on rear south-facing slope. Fully permitted. TPO waterproofing membrane, no street visibility.'}
            </p>
          </div>
          <div className="pdf-divider" />
          <div className="acc-pdf-section">
            <p className="acc-pdf-label">MATERIALS &amp; FINISHES</p>
            {isDeck ? (
              <>
                <div className="acc-pdf-row"><span>Decking</span><span>Trex Transcend — Tiki Torch</span></div>
                <div className="acc-pdf-row"><span>Frame</span><span>Pressure-treated lumber</span></div>
                <div className="acc-pdf-row"><span>Railing</span><span>Aluminum — Charcoal Black</span></div>
              </>
            ) : (
              <>
                <div className="acc-pdf-row"><span>Panels</span><span>SunPower M-Series 400W</span></div>
                <div className="acc-pdf-row"><span>Mounting</span><span>IronRidge flush rail</span></div>
                <div className="acc-pdf-row"><span>Waterproof</span><span>TPO membrane, fully bonded</span></div>
              </>
            )}
          </div>
        </div>

        {/* Page 2 — Site Plan */}
        <div className="pdf-doc acc-pdf-doc acc-pdf-doc--page2">
          <p className="acc-pdf-label" style={{marginBottom:12}}>SITE PLAN / SKETCH</p>
          <div className="acc-pdf-sketch">
            <div className="acc-sketch-house">
              <div className="acc-sketch-label">House</div>
              {isDeck && <div className="acc-sketch-deck">Deck<br/>12×16</div>}
              {!isDeck && <div className="acc-sketch-solar">Solar Panels<br/>(Rear Roof)</div>}
            </div>
            <div className="acc-sketch-yard">Rear Yard</div>
          </div>
          <p className="acc-pdf-note">Not to scale. For illustrative purposes only. Full engineering drawings attached separately.</p>
        </div>

        {/* Page 3 — Signatures */}
        <div className="pdf-doc acc-pdf-doc acc-pdf-doc--page3">
          <p className="acc-pdf-label" style={{marginBottom:12}}>CERTIFICATION &amp; SIGNATURE</p>
          <p className="acc-pdf-cert">I certify that the information provided is accurate and that all work will be performed in accordance with applicable codes, the CC&amp;Rs, and the Cardinal Hills HOA Architectural Guidelines.</p>
          <div className="acc-pdf-sig-row">
            <div className="acc-pdf-sig-block">
              <div className="acc-pdf-sig-line" />
              <span>Homeowner Signature</span>
            </div>
            <div className="acc-pdf-sig-block">
              <div className="acc-pdf-sig-line" />
              <span>Date</span>
            </div>
          </div>
          <div className="pdf-divider" style={{margin:'20px 0'}} />
          <p className="acc-pdf-label" style={{marginBottom:12}}>FOR COMMITTEE USE ONLY</p>
          <div className="acc-pdf-row"><span>Received</span><span>{task.formReceived || '—'}</span></div>
          <div className="acc-pdf-row"><span>To Committee</span><span>{task.toCommittee}</span></div>
          <div className="acc-pdf-row"><span>Response Due</span><span>{task.response}</span></div>
          <div className="acc-pdf-row"><span>Auto Approval</span><span>{task.autoApproval}</span></div>
          <div className="acc-pdf-row"><span>Status</span><span>{task.status}</span></div>
          <div className="acc-pdf-sig-row" style={{marginTop:24}}>
            <div className="acc-pdf-sig-block">
              <div className="acc-pdf-sig-line" />
              <span>Committee Chair</span>
            </div>
            <div className="acc-pdf-sig-block">
              <div className="acc-pdf-sig-line" />
              <span>Decision Date</span>
            </div>
          </div>
          <p className="pdf-footer" style={{marginTop:16}}>Cardinal Hills HOA · Architectural Review Committee · 1200 Cardinal Dr, Miami FL 33130</p>
        </div>

      </div>
    </div>
  )
}

/* ── ACC Decision panel ───────────────────────────────── */
const DECISION_OPTIONS = [
  {
    key: 'approve',
    label: 'Approve',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    color: '#6bcb77',
    bg: 'rgba(107,203,119,0.10)',
    border: 'rgba(107,203,119,0.30)',
  },
  {
    key: 'stipulations',
    label: 'Approve With Stipulations',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    color: '#ffb74d',
    bg: 'rgba(255,183,77,0.10)',
    border: 'rgba(255,183,77,0.30)',
  },
  {
    key: 'deny',
    label: 'Deny',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    color: '#e05c5c',
    bg: 'rgba(224,92,92,0.10)',
    border: 'rgba(224,92,92,0.30)',
  },
]

function AccDecisionPanel({ task, onClose }) {
  const [selected, setSelected] = useState(null)
  const [comment, setComment] = useState('')
  const canSubmit = selected !== null

  return (
    <div className="inv-panel">
      <PanelHeader title="Add Decision" hideTitle onClose={onClose} />
      <div className="inv-panel__body acc-decision-body">
        <h2 className="inv-panel__page-title">Add Decision</h2>
        <p className="acc-decision-meta">{task.address} · {task.accType}</p>

        <p className="acc-decision-label">Your Decision</p>
        <div className="acc-decision-options">
          {DECISION_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className={`acc-decision-opt${selected === opt.key ? ' acc-decision-opt--selected' : ''}`}
              style={{
                '--opt-color': opt.color,
                '--opt-bg': opt.bg,
                '--opt-border': opt.border,
              }}
              onClick={() => setSelected(opt.key)}
            >
              <span className="acc-decision-opt__icon">{opt.icon}</span>
              <span className="acc-decision-opt__label">{opt.label}</span>
              {selected === opt.key && (
                <span className="acc-decision-opt__check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="acc-decision-label" style={{marginTop: 20}}>Comment <span className="acc-decision-optional">(optional)</span></p>
        <textarea
          className="acc-decision-textarea"
          placeholder="Add a note about your decision…"
          rows={4}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      <div className="acc-decision-footer">
        <button
          className={`acc-decision-submit${canSubmit ? ' acc-decision-submit--active' : ''}`}
          disabled={!canSubmit}
          onClick={onClose}
        >
          Submit Decision
        </button>
      </div>
    </div>
  )
}

/* ── Icons ────────────────────────────────────────────── */
function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
      <line x1="10" y1="18" x2="14" y2="18"/>
    </svg>
  )
}
function ListViewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}
function CardViewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="9" height="9" rx="1"/>
      <rect x="13" y="3" width="9" height="9" rx="1"/>
      <rect x="2" y="13" width="9" height="9" rx="1"/>
      <rect x="13" y="13" width="9" height="9" rx="1"/>
    </svg>
  )
}
function ApproveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function SkipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  )
}
function CheckBigIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e05c5c', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
function ChevronRowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF8EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.75 }}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}
function WoAllIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function WoOpenIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
}
function WoProgressIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function WoCompletedIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}
function PanelBellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function PanelUserIcon() {
  return (
    <svg width="12" height="17" viewBox="0 0 12 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.00019 9.92822C3.15651 9.92822 0.649013 12.0712 0.0365938 15.0234C-0.0640486 15.5113 0.0451591 16.0128 0.33638 16.4004C0.623318 16.7811 1.05158 17 1.51197 17H10.4884C10.9467 17 11.3749 16.7811 11.664 16.4004C11.9552 16.0128 12.0666 15.5113 11.9638 15.0234C11.3514 12.0712 8.84387 9.92822 6.00019 9.92822Z" fill="#235237"/>
      <path d="M6.00021 8.38259C8.17152 8.38259 9.93812 6.50181 9.93812 4.19016C9.93812 1.8785 8.17152 0 6.00021 0C3.82891 0 2.06445 1.88078 2.06445 4.19244C2.06445 6.50409 3.83105 8.38487 6.00235 8.38487L6.00021 8.38259Z" fill="#235237"/>
    </svg>
  )
}
function PanelBoardIcon() {
  return (
    <svg width="17" height="15" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.0952 12.9606H7.90484C7.61426 12.9606 7.37842 13.1993 7.37842 13.4933C7.37842 13.7873 7.61426 14.0259 7.90484 14.0259H12.0952C12.3858 14.0259 12.6216 13.7873 12.6216 13.4933C12.6216 13.1993 12.3858 12.9606 12.0952 12.9606Z" fill="currentColor"/>
      <path d="M5.66022 8.30939L4.86637 10.1737C4.75056 10.4443 4.8748 10.7575 5.14222 10.8747C5.2096 10.9045 5.2812 10.9173 5.35069 10.9173C5.55494 10.9173 5.74866 10.7958 5.835 10.5955L6.49198 9.05298H13.6893L14.1652 10.2653C14.2726 10.538 14.5779 10.6722 14.8495 10.5636C15.119 10.4549 15.2517 10.146 15.1443 9.87114L14.5358 8.32217C14.4557 8.11976 14.262 7.98553 14.0472 7.98553H6.14243C5.93186 7.98553 5.74235 8.11124 5.65812 8.30726L5.66022 8.30939Z" fill="currentColor"/>
      <path d="M9.99996 5.46718C11.4887 5.46718 12.7016 4.23994 12.7016 2.73359C12.7016 1.22724 11.4887 0 9.99996 0C8.51123 0 7.29834 1.22724 7.29834 2.73359C7.29834 4.23994 8.51123 5.46718 9.99996 5.46718Z" fill="currentColor"/>
      <path d="M17.2983 2.73364C15.8096 2.73364 14.5967 3.96088 14.5967 5.46723C14.5967 6.97358 15.8096 8.20082 17.2983 8.20082C18.787 8.20082 19.9999 6.97358 19.9999 5.46723C19.9999 3.96088 18.787 2.73364 17.2983 2.73364Z" fill="currentColor"/>
      <path d="M2.70162 8.20082C4.19035 8.20082 5.40324 6.97358 5.40324 5.46723C5.40324 3.96088 4.19035 2.73364 2.70162 2.73364C1.21289 2.73364 0 3.96088 0 5.46723C0 6.97358 1.21289 8.20082 2.70162 8.20082Z" fill="currentColor"/>
      <path d="M3.83443 11.7696C2.3457 11.7696 1.13281 12.9968 1.13281 14.5032C1.13281 16.0095 2.3457 17.2368 3.83443 17.2368C5.32316 17.2368 6.53605 16.0095 6.53605 14.5032C6.53605 12.9968 5.32316 11.7696 3.83443 11.7696Z" fill="currentColor"/>
      <path d="M16.1655 11.7696C14.6768 11.7696 13.4639 12.9968 13.4639 14.5032C13.4639 16.0095 14.6768 17.2368 16.1655 17.2368C17.6542 17.2368 18.8671 16.0095 18.8671 14.5032C18.8671 12.9968 17.6542 11.7696 16.1655 11.7696Z" fill="currentColor"/>
    </svg>
  )
}
function PanelBackIcon() {
  return (
    <svg width="43" height="43" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
function ThumbsUpVoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  )
}
function ThumbsDownVoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
    </svg>
  )
}
function PendingVoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
