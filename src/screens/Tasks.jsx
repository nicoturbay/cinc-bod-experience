import { useState } from 'react'
import './Tasks.css'

const TASKS = [
  {
    id: 1,
    type: 'Invoice',
    title: 'Approve invoice — GreenScape LLC',
    amount: '$3,800',
    due: 'Due today',
    priority: 'urgent',
    done: false,
  },
  {
    id: 2,
    type: 'ACC Request',
    title: 'Review fence installation — 214 Maple Dr',
    amount: null,
    due: 'Due tomorrow',
    priority: 'normal',
    done: false,
  },
  {
    id: 3,
    type: 'Invoice',
    title: 'Approve invoice — ABC Plumbing',
    amount: '$2,400',
    due: 'Due tomorrow',
    priority: 'normal',
    done: false,
  },
  {
    id: 4,
    type: 'ACC Request',
    title: 'Review solar panel request — 88 Oak Ln',
    amount: null,
    due: 'Apr 22',
    priority: 'low',
    done: false,
  },
  {
    id: 5,
    type: 'Violation',
    title: 'Review violation trends report',
    amount: null,
    due: 'Apr 24',
    priority: 'low',
    done: true,
  },
  {
    id: 6,
    type: 'Meeting',
    title: 'Review board meeting agenda',
    amount: null,
    due: 'May 6',
    priority: 'normal',
    done: true,
  },
]

const PRIORITY_COLOR = {
  urgent: 'var(--red)',
  normal: 'var(--amber)',
  low:    'var(--text-muted)',
}

const TYPE_EMOJI = {
  'Invoice':    '💰',
  'ACC Request':'🏗️',
  'Violation':  '⚠️',
  'Meeting':    '📋',
}

export default function Tasks() {
  const [tasks, setTasks] = useState(TASKS)
  const [filter, setFilter] = useState('pending')

  const filtered = tasks.filter(t => filter === 'all' ? true : filter === 'pending' ? !t.done : t.done)
  const pendingCount = tasks.filter(t => !t.done).length

  function toggle(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  return (
    <div className="screen">
      <div className="screen-inner">

        {/* Summary */}
        <div className="tasks-summary card">
          <div className="tasks-summary__stat">
            <span className="tasks-summary__num" style={{ color: 'var(--red)' }}>{pendingCount}</span>
            <span className="tasks-summary__lbl">Pending</span>
          </div>
          <div className="tasks-summary__div" />
          <div className="tasks-summary__stat">
            <span className="tasks-summary__num" style={{ color: 'var(--lime)' }}>{tasks.length - pendingCount}</span>
            <span className="tasks-summary__lbl">Completed</span>
          </div>
          <div className="tasks-summary__div" />
          <div className="tasks-summary__stat">
            <span className="tasks-summary__num" style={{ color: 'var(--amber)' }}>2</span>
            <span className="tasks-summary__lbl">Due today</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="tasks-tabs">
          {['pending', 'done', 'all'].map(f => (
            <button
              key={f}
              className={`tasks-tab${filter === f ? ' tasks-tab--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'pending' ? 'Pending' : f === 'done' ? 'Completed' : 'All'}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="card">
          {filtered.length === 0 && (
            <p className="tasks-empty">No tasks here ✓</p>
          )}
          {filtered.map((task, i) => (
            <div key={task.id}>
              {i > 0 && <div className="divider" />}
              <div className={`task-row${task.done ? ' task-row--done' : ''}`}>
                <button
                  className={`task-check${task.done ? ' task-check--done' : ''}`}
                  onClick={() => toggle(task.id)}
                  aria-label={task.done ? 'Mark pending' : 'Mark done'}
                >
                  {task.done && <CheckIcon />}
                </button>
                <div className="task-row__info">
                  <div className="task-row__type-row">
                    <span className="task-row__emoji">{TYPE_EMOJI[task.type]}</span>
                    <span className="task-row__type">{task.type}</span>
                    {task.amount && <span className="task-row__amount">{task.amount}</span>}
                  </div>
                  <p className="task-row__title">{task.title}</p>
                  <p className="task-row__due" style={{ color: PRIORITY_COLOR[task.priority] }}>
                    {task.due}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
