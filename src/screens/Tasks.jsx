import { useState, useRef, useEffect } from 'react'
import { useMode } from '../ModeContext'
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
                <CardContent task={task} flyCard={stackIdx === 0 ? flyCard : null} flyOff={flyOff} />
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
function CardContent({ task, flyCard, flyOff }) {
  if (task.type === 'Invoice')   return <InvoiceCardContent   task={task} flyCard={flyCard} flyOff={flyOff} />
  if (task.type === 'WorkOrder') return <WorkOrderCardContent task={task} flyCard={flyCard} flyOff={flyOff} />
  if (task.type === 'Violation') return <ViolationCardContent task={task} />
  if (task.type === 'ACC')       return <ACCCardContent       task={task} />
  if (task.type === 'Task')      return <TaskCardContent      task={task} flyCard={flyCard} flyOff={flyOff} />
  return null
}

/* ── Invoice card ─────────────────────────────────────── */
function InvoiceCardContent({ task, flyCard, flyOff }) {
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
          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={VendorSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">{task.title}</span>
              <span className="inv-row__sub">Vendor Info</span>
            </span>
            <ChevronRowIcon />
          </button>

          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={AttachSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Invoice</span>
            </span>
            <ChevronRowIcon />
          </button>

          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={ThumbsUpSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Previous Approvers</span>
            </span>
            {task.approversCount > 0 && (
              <span className="inv-row__badge">{task.approversCount}</span>
            )}
            <ChevronRowIcon />
          </button>

          <button className="inv-row inv-row--last" onPointerDown={stopDrag}>
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
function ACCCardContent({ task }) {
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
          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={LogSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Log &amp; Notes</span>
            </span>
            {task.logCount > 0 && <span className="inv-row__badge">{task.logCount}</span>}
            <ChevronRowIcon />
          </button>

          <button className="inv-row" onPointerDown={stopDrag}>
            <span className="inv-row__icon"><img src={ChatSvg} className="inv-row__svg" alt="" /></span>
            <span className="inv-row__content">
              <span className="inv-row__title">Committee</span>
            </span>
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
      <div className="acc-actions" onPointerDown={stopDrag}>
        <button className="acc-btn acc-btn--comment">Add Comment</button>
        <button className="acc-btn acc-btn--decision">Add Decision</button>
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
