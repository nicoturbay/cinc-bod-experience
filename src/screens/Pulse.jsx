import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMode } from '../ModeContext'
import PulseTourModal from '../components/PulseTourModal'
import './Pulse.css'

const PERIODS = [
  { key: 'apr-2026', label: 'April 2026',    group: 'Monthly',   projMult: 12 },
  { key: 'mar-2026', label: 'March 2026',    group: 'Monthly',   projMult: 12 },
  { key: 'feb-2026', label: 'February 2026', group: 'Monthly',   projMult: 12 },
  { key: 'q2-2026',  label: 'Q2 2026',       group: 'Quarterly', projMult: 12 }, // 1 month into Q2
  { key: 'q1-2026',  label: 'Q1 2026',       group: 'Quarterly', projMult: 4  },
  { key: 'q4-2025',  label: 'Q4 2025',       group: 'Quarterly', projMult: 4  },
  { key: 'ytd-2026', label: '2026 YTD',      group: 'Yearly',    projMult: 3  }, // 4 months elapsed
  { key: 'yr-2025',  label: '2025',          group: 'Yearly',    projMult: 1  },
]

// Annual budget per category — same every year, used for trend projection
const ANNUAL_BUDGETS = {
  'Landscaping':    144000,
  'Management':     102000,
  'Maintenance':     72000,
  'Insurance':       81600,
  'Utilities':       50400,
  'Administrative':  42000,
}

const PERIOD_DATA = {
  'apr-2026': {
    kpis: [
      { label: 'Open violations',    value: '42',      delta: '↑ +12 this month',   deltaColor: 'red',   route: '/pulse/violations'  },
      { label: 'Delinquent accounts',value: '18',      delta: '↓ -9 vs last month', deltaColor: 'green', route: '/pulse/delinquency' },
      { label: 'Total delinquency',  value: '$84,210', delta: '+$19,400',            deltaColor: 'red',   route: '/pulse/delinquency' },
      { label: 'Budget variance',    value: '-$3,180', delta: '2% over',             deltaColor: 'red',   route: '/pulse/budget'      },
    ],
    expenses: {
      total: { budget: 41000, actual: 44180 },
      categories: [
        { name: 'Landscaping',    budget: 12000, actual: 12200 }, // At risk  — proj $146k vs $144k
        { name: 'Management',     budget:  8500, actual:  7800 }, // On track — proj $93.6k vs $102k
        { name: 'Maintenance',    budget:  6000, actual: 10590 }, // Over     — proj $127k vs $72k
        { name: 'Insurance',      budget:  6800, actual:  6200 }, // On track — proj $74.4k vs $81.6k
        { name: 'Utilities',      budget:  4200, actual:  3890 }, // On track — proj $46.7k vs $50.4k
        { name: 'Administrative', budget:  3500, actual:  3500 }, // At risk  — proj $42k vs $42k
      ],
    },
    invoices: {
      total: 18340,
      count: 7,
      items: [
        { vendor: 'Green Valley Landscaping', amount: 6200 },
        { vendor: 'Pacific Pool Services',    amount: 3800 },
        { vendor: 'Westside Plumbing',        amount: 2140 },
        { vendor: 'Arrow Electric',           amount: 1900 },
        { vendor: 'Allied Janitorial',        amount: 1450 },
      ],
    },
    violations: [
      { type: 'Landscaping',   count: 18, pct: 100 },
      { type: 'Home exterior', count: 11, pct: 61  },
      { type: 'Common area',   count: 7,  pct: 39  },
      { type: 'Parking',       count: 3,  pct: 17  },
      { type: 'Trash',         count: 1,  pct: 6   },
    ],
    delinquencies: [
      { address: '735 E Sierra Madre Ave', name: 'Robert & Patricia Thompson', tag: 'Lien',     tagColor: 'red'   },
      { address: '420 E Newcomer Dr',      name: 'Michael Davis',              tag: 'Lien',     tagColor: 'red'   },
      { address: '854 E Weeping Willow Ln',name: 'James & Carol Wilson',       tag: 'Lien',     tagColor: 'red'   },
      { address: '612 W Juniper Ct',       name: 'William & Sandra Johnson',   tag: 'Pre-lien', tagColor: 'amber' },
      { address: '301 N Magnolia Ave',     name: 'David Martinez',             tag: 'Pre-lien', tagColor: 'amber' },
    ],
  },

  'mar-2026': {
    kpis: [
      { label: 'Open violations',    value: '30',      delta: '↓ -4 vs February',   deltaColor: 'green', route: '/pulse/violations'  },
      { label: 'Delinquent accounts',value: '27',      delta: '↑ +3 vs February',   deltaColor: 'red',   route: '/pulse/delinquency' },
      { label: 'Total delinquency',  value: '$64,810', delta: '+$8,200',             deltaColor: 'red',   route: '/pulse/delinquency' },
      { label: 'Budget variance',    value: '-$1,440', delta: '0.9% over',           deltaColor: 'red',   route: '/pulse/budget'      },
    ],
    expenses: {
      total: { budget: 41000, actual: 42440 },
      categories: [
        { name: 'Landscaping',    budget: 12000, actual: 12100 }, // At risk  — proj $145k vs $144k
        { name: 'Management',     budget:  8500, actual:  7900 }, // On track
        { name: 'Maintenance',    budget:  6000, actual:  9140 }, // Over     — proj $110k vs $72k
        { name: 'Insurance',      budget:  6800, actual:  6300 }, // On track
        { name: 'Utilities',      budget:  4200, actual:  3800 }, // On track
        { name: 'Administrative', budget:  3500, actual:  3200 }, // On track
      ],
    },
    invoices: {
      total: 14680,
      count: 6,
      items: [
        { vendor: 'Green Valley Landscaping', amount: 5400 },
        { vendor: 'Pacific Pool Services',    amount: 3800 },
        { vendor: 'Westside Plumbing',        amount: 2280 },
        { vendor: 'Allied Janitorial',        amount: 1450 },
        { vendor: 'Arrow Electric',           amount: 1750 },
      ],
    },
    violations: [
      { type: 'Landscaping',   count: 14, pct: 100 },
      { type: 'Home exterior', count: 8,  pct: 57  },
      { type: 'Parking',       count: 5,  pct: 36  },
      { type: 'Common area',   count: 2,  pct: 14  },
      { type: 'Trash',         count: 1,  pct: 7   },
    ],
    delinquencies: [
      { address: '735 E Sierra Madre Ave', name: 'Robert & Patricia Thompson', tag: 'Lien',     tagColor: 'red'   },
      { address: '128 S Cedar Ln',         name: 'Thomas & Karen Anderson',    tag: 'Lien',     tagColor: 'red'   },
      { address: '854 E Weeping Willow Ln',name: 'James & Carol Wilson',       tag: 'Pre-lien', tagColor: 'amber' },
      { address: '612 W Juniper Ct',       name: 'William & Sandra Johnson',   tag: 'Pre-lien', tagColor: 'amber' },
      { address: '947 W Oak Tree Rd',      name: 'Christopher Brown',          tag: 'Pre-lien', tagColor: 'amber' },
    ],
  },

  'feb-2026': {
    kpis: [
      { label: 'Open violations',    value: '34',     delta: '↑ +6 vs January',    deltaColor: 'red',   route: '/pulse/violations'  },
      { label: 'Delinquent accounts',value: '24',     delta: '↓ -2 vs January',    deltaColor: 'green', route: '/pulse/delinquency' },
      { label: 'Total delinquency',  value: '$56,600',delta: '-$3,100',             deltaColor: 'green', route: '/pulse/delinquency' },
      { label: 'Budget variance',    value: '+$820',  delta: '0.5% under',          deltaColor: 'green', route: '/pulse/budget'      },
    ],
    expenses: {
      total: { budget: 41000, actual: 40180 },
      categories: [
        { name: 'Landscaping',    budget: 12000, actual: 11500 }, // At risk  — proj $138k vs $144k
        { name: 'Management',     budget:  8500, actual:  7800 }, // On track
        { name: 'Maintenance',    budget:  6000, actual:  7500 }, // Over     — proj $90k vs $72k
        { name: 'Insurance',      budget:  6800, actual:  6200 }, // On track
        { name: 'Utilities',      budget:  4200, actual:  3780 }, // On track
        { name: 'Administrative', budget:  3500, actual:  3400 }, // At risk  — proj $40.8k vs $42k
      ],
    },
    invoices: {
      total: 11920,
      count: 5,
      items: [
        { vendor: 'Green Valley Landscaping', amount: 4600 },
        { vendor: 'Pacific Pool Services',    amount: 3800 },
        { vendor: 'Westside Plumbing',        amount: 1420 },
        { vendor: 'Allied Janitorial',        amount: 1450 },
        { vendor: 'Secure Gate Systems',      amount:  650 },
      ],
    },
    violations: [
      { type: 'Landscaping',   count: 16, pct: 100 },
      { type: 'Home exterior', count: 9,  pct: 56  },
      { type: 'Common area',   count: 5,  pct: 31  },
      { type: 'Trash',         count: 3,  pct: 19  },
      { type: 'Parking',       count: 1,  pct: 6   },
    ],
    delinquencies: [
      { address: '420 E Newcomer Dr',  name: 'Michael Davis',            tag: 'Lien',     tagColor: 'red'   },
      { address: '216 N Birch St',     name: 'Daniel & Susan Taylor',    tag: 'Lien',     tagColor: 'red'   },
      { address: '612 W Juniper Ct',   name: 'William & Sandra Johnson', tag: 'Pre-lien', tagColor: 'amber' },
      { address: '301 N Magnolia Ave', name: 'David Martinez',           tag: 'Pre-lien', tagColor: 'amber' },
      { address: '503 E Sycamore Blvd',name: 'Mark & Jennifer White',    tag: 'Pre-lien', tagColor: 'amber' },
    ],
  },

  'q2-2026': {
    kpis: [
      { label: 'Open violations',    value: '42',      delta: '↑ +10 vs Q1',  deltaColor: 'red',   route: '/pulse/violations'  },
      { label: 'Delinquent accounts',value: '18',      delta: '↓ -9 vs Q1',   deltaColor: 'green', route: '/pulse/delinquency' },
      { label: 'Total delinquency',  value: '$84,210', delta: '+$12,830',      deltaColor: 'red',   route: '/pulse/delinquency' },
      { label: 'Budget variance',    value: '-$3,180', delta: '2% over',       deltaColor: 'red',   route: '/pulse/budget'      },
    ],
    expenses: {
      total: { budget: 41000, actual: 44180 },
      categories: [
        { name: 'Landscaping',    budget: 12000, actual: 12200 }, // At risk
        { name: 'Management',     budget:  8500, actual:  7800 }, // On track
        { name: 'Maintenance',    budget:  6000, actual: 10590 }, // Over
        { name: 'Insurance',      budget:  6800, actual:  6200 }, // On track
        { name: 'Utilities',      budget:  4200, actual:  3890 }, // On track
        { name: 'Administrative', budget:  3500, actual:  3500 }, // At risk
      ],
    },
    invoices: {
      total: 18340,
      count: 7,
      items: [
        { vendor: 'Green Valley Landscaping', amount: 6200 },
        { vendor: 'Pacific Pool Services',    amount: 3800 },
        { vendor: 'Westside Plumbing',        amount: 2140 },
        { vendor: 'Arrow Electric',           amount: 1900 },
        { vendor: 'Allied Janitorial',        amount: 1450 },
      ],
    },
    violations: [
      { type: 'Landscaping',   count: 18, pct: 100 },
      { type: 'Home exterior', count: 11, pct: 61  },
      { type: 'Common area',   count: 7,  pct: 39  },
      { type: 'Parking',       count: 3,  pct: 17  },
      { type: 'Trash',         count: 1,  pct: 6   },
    ],
    delinquencies: [
      { address: '735 E Sierra Madre Ave', name: 'Robert & Patricia Thompson', tag: 'Lien',     tagColor: 'red'   },
      { address: '420 E Newcomer Dr',      name: 'Michael Davis',              tag: 'Lien',     tagColor: 'red'   },
      { address: '854 E Weeping Willow Ln',name: 'James & Carol Wilson',       tag: 'Lien',     tagColor: 'red'   },
      { address: '612 W Juniper Ct',       name: 'William & Sandra Johnson',   tag: 'Pre-lien', tagColor: 'amber' },
      { address: '301 N Magnolia Ave',     name: 'David Martinez',             tag: 'Pre-lien', tagColor: 'amber' },
    ],
  },

  'q1-2026': {
    kpis: [
      { label: 'Open violations',    value: '96',      delta: "↓ -8 vs Q4 '25",  deltaColor: 'green', route: '/pulse/violations'  },
      { label: 'Delinquent accounts',value: '27',      delta: "↓ -5 vs Q4 '25",  deltaColor: 'green', route: '/pulse/delinquency' },
      { label: 'Total delinquency',  value: '$71,380', delta: '-$11,200',          deltaColor: 'green', route: '/pulse/delinquency' },
      { label: 'Budget variance',    value: '-$2,140', delta: '0.7% over',         deltaColor: 'red',   route: '/pulse/budget'      },
    ],
    expenses: {
      total: { budget: 123000, actual: 125140 },
      categories: [
        { name: 'Landscaping',    budget: 36000, actual: 35200 }, // At risk  — ×4 = $140.8k vs $144k
        { name: 'Management',     budget: 25500, actual: 22800 }, // On track
        { name: 'Maintenance',    budget: 18000, actual: 28640 }, // Over     — ×4 = $114.6k vs $72k
        { name: 'Insurance',      budget: 20400, actual: 18900 }, // On track
        { name: 'Utilities',      budget: 12600, actual: 11640 }, // On track
        { name: 'Administrative', budget: 10500, actual:  7960 }, // On track
      ],
    },
    invoices: {
      total: 44940,
      count: 18,
      items: [
        { vendor: 'Green Valley Landscaping', amount: 16200 },
        { vendor: 'Pacific Pool Services',    amount: 11400 },
        { vendor: 'Westside Plumbing',        amount:  5840 },
        { vendor: 'Arrow Electric',           amount:  5600 },
        { vendor: 'Allied Janitorial',        amount:  4350 },
      ],
    },
    violations: [
      { type: 'Landscaping',   count: 38, pct: 100 },
      { type: 'Home exterior', count: 29, pct: 76  },
      { type: 'Parking',       count: 16, pct: 42  },
      { type: 'Common area',   count: 9,  pct: 24  },
      { type: 'Trash',         count: 4,  pct: 11  },
    ],
    delinquencies: [
      { address: '420 E Newcomer Dr',  name: 'Michael Davis',            tag: 'Lien',     tagColor: 'red'   },
      { address: '128 S Cedar Ln',     name: 'Thomas & Karen Anderson',  tag: 'Lien',     tagColor: 'red'   },
      { address: '216 N Birch St',     name: 'Daniel & Susan Taylor',    tag: 'Pre-lien', tagColor: 'amber' },
      { address: '612 W Juniper Ct',   name: 'William & Sandra Johnson', tag: 'Pre-lien', tagColor: 'amber' },
      { address: '789 W Elm Dr',       name: 'Steven Harris',            tag: 'Pre-lien', tagColor: 'amber' },
    ],
  },

  'q4-2025': {
    kpis: [
      { label: 'Open violations',    value: '104',     delta: "↑ +22 vs Q3 '25", deltaColor: 'red',   route: '/pulse/violations'  },
      { label: 'Delinquent accounts',value: '32',      delta: "↑ +7 vs Q3 '25",  deltaColor: 'red',   route: '/pulse/delinquency' },
      { label: 'Total delinquency',  value: '$92,580', delta: '+$14,600',          deltaColor: 'red',   route: '/pulse/delinquency' },
      { label: 'Budget variance',    value: '+$1,260', delta: '0.4% under',        deltaColor: 'green', route: '/pulse/budget'      },
    ],
    expenses: {
      total: { budget: 123000, actual: 121740 },
      categories: [
        { name: 'Landscaping',    budget: 36000, actual: 33800 }, // On track — ×4=$135.2k vs $144k
        { name: 'Management',     budget: 25500, actual: 23500 }, // On track — ×4=$94k vs $102k
        { name: 'Maintenance',    budget: 18000, actual: 26400 }, // Over     — ×4=$105.6k vs $72k
        { name: 'Insurance',      budget: 20400, actual: 19200 }, // At risk  — ×4=$76.8k vs $81.6k
        { name: 'Utilities',      budget: 12600, actual: 11800 }, // On track — ×4=$47.2k vs $50.4k
        { name: 'Administrative', budget: 10500, actual:  7040 }, // On track — ×4=$28.2k vs $42k
      ],
    },
    invoices: {
      total: 38760,
      count: 15,
      items: [
        { vendor: 'Green Valley Landscaping', amount: 14400 },
        { vendor: 'Pacific Pool Services',    amount: 11400 },
        { vendor: 'Arrow Electric',           amount:  5200 },
        { vendor: 'Westside Plumbing',        amount:  4210 },
        { vendor: 'Allied Janitorial',        amount:  3550 },
      ],
    },
    violations: [
      { type: 'Home exterior', count: 44, pct: 100 },
      { type: 'Landscaping',   count: 34, pct: 77  },
      { type: 'Common area',   count: 16, pct: 36  },
      { type: 'Parking',       count: 7,  pct: 16  },
      { type: 'Trash',         count: 3,  pct: 7   },
    ],
    delinquencies: [
      { address: '735 E Sierra Madre Ave', name: 'Robert & Patricia Thompson', tag: 'Lien',     tagColor: 'red'   },
      { address: '612 W Juniper Ct',       name: 'William & Sandra Johnson',   tag: 'Lien',     tagColor: 'red'   },
      { address: '128 S Cedar Ln',         name: 'Thomas & Karen Anderson',    tag: 'Lien',     tagColor: 'red'   },
      { address: '301 N Magnolia Ave',     name: 'David Martinez',             tag: 'Pre-lien', tagColor: 'amber' },
      { address: '503 E Sycamore Blvd',   name: 'Mark & Jennifer White',      tag: 'Pre-lien', tagColor: 'amber' },
    ],
  },

  'ytd-2026': {
    kpis: [
      { label: 'Open violations',    value: '138',      delta: '↑ +14 vs 2025 YTD', deltaColor: 'red',   route: '/pulse/violations'  },
      { label: 'Delinquent accounts',value: '33',       delta: '↑ +4 vs 2025 YTD',  deltaColor: 'red',   route: '/pulse/delinquency' },
      { label: 'Total delinquency',  value: '$155,790', delta: '+$21,400',            deltaColor: 'red',   route: '/pulse/delinquency' },
      { label: 'Budget variance',    value: '-$4,320',  delta: '0.8% over',           deltaColor: 'red',   route: '/pulse/budget'      },
    ],
    expenses: {
      total: { budget: 164000, actual: 168320 },
      categories: [
        { name: 'Landscaping',    budget: 48000, actual: 47800 }, // At risk  — ×3=$143.4k vs $144k
        { name: 'Management',     budget: 34000, actual: 30400 }, // On track — ×3=$91.2k vs $102k
        { name: 'Maintenance',    budget: 24000, actual: 38800 }, // Over     — ×3=$116.4k vs $72k
        { name: 'Insurance',      budget: 27200, actual: 24600 }, // On track — ×3=$73.8k vs $81.6k
        { name: 'Utilities',      budget: 16800, actual: 14680 }, // On track — ×3=$44k vs $50.4k
        { name: 'Administrative', budget: 14000, actual: 12040 }, // On track — ×3=$36.1k vs $42k
      ],
    },
    invoices: {
      total: 57260,
      count: 22,
      items: [
        { vendor: 'Green Valley Landscaping', amount: 20800 },
        { vendor: 'Pacific Pool Services',    amount: 15200 },
        { vendor: 'Westside Plumbing',        amount:  7560 },
        { vendor: 'Arrow Electric',           amount:  7650 },
        { vendor: 'Allied Janitorial',        amount:  6050 },
      ],
    },
    violations: [
      { type: 'Landscaping',   count: 52, pct: 100 },
      { type: 'Home exterior', count: 41, pct: 79  },
      { type: 'Common area',   count: 22, pct: 42  },
      { type: 'Parking',       count: 14, pct: 27  },
      { type: 'Trash',         count: 9,  pct: 17  },
    ],
    delinquencies: [
      { address: '735 E Sierra Madre Ave', name: 'Robert & Patricia Thompson', tag: 'Lien', tagColor: 'red' },
      { address: '420 E Newcomer Dr',      name: 'Michael Davis',              tag: 'Lien', tagColor: 'red' },
      { address: '612 W Juniper Ct',       name: 'William & Sandra Johnson',   tag: 'Lien', tagColor: 'red' },
      { address: '854 E Weeping Willow Ln',name: 'James & Carol Wilson',       tag: 'Lien', tagColor: 'red' },
      { address: '128 S Cedar Ln',         name: 'Thomas & Karen Anderson',    tag: 'Pre-lien', tagColor: 'amber' },
    ],
  },

  'yr-2025': {
    kpis: [
      { label: 'Open violations',    value: '367',      delta: '↓ -31 vs 2024', deltaColor: 'green', route: '/pulse/violations'  },
      { label: 'Delinquent accounts',value: '38',       delta: '↓ -6 vs 2024',  deltaColor: 'green', route: '/pulse/delinquency' },
      { label: 'Total delinquency',  value: '$318,440', delta: '-$22,100',       deltaColor: 'green', route: '/pulse/delinquency' },
      { label: 'Budget variance',    value: '-$8,960',  delta: '0.7% over',      deltaColor: 'red',   route: '/pulse/budget'      },
    ],
    expenses: {
      total: { budget: 492000, actual: 500960 },
      categories: [
        { name: 'Landscaping',    budget: 144000, actual: 152000 }, // Over     — 105.6%
        { name: 'Management',     budget: 102000, actual:  95200 }, // On track — 93.3%
        { name: 'Maintenance',    budget:  72000, actual:  89200 }, // Over     — 123.9%
        { name: 'Insurance',      budget:  81600, actual:  78400 }, // At risk  — 96.1%
        { name: 'Utilities',      budget:  50400, actual:  47160 }, // On track — 93.6%
        { name: 'Administrative', budget:  42000, actual:  39000 }, // On track — 92.9%
      ],
    },
    invoices: {
      total: 142800,
      count: 58,
      items: [
        { vendor: 'Green Valley Landscaping', amount: 57200 },
        { vendor: 'Pacific Pool Services',    amount: 38400 },
        { vendor: 'Westside Plumbing',        amount: 19840 },
        { vendor: 'Arrow Electric',           amount: 14800 },
        { vendor: 'Allied Janitorial',        amount: 12560 },
      ],
    },
    violations: [
      { type: 'Landscaping',   count: 148, pct: 100 },
      { type: 'Home exterior', count: 112, pct: 76  },
      { type: 'Common area',   count: 63,  pct: 43  },
      { type: 'Parking',       count: 34,  pct: 23  },
      { type: 'Trash',         count: 10,  pct: 7   },
    ],
    delinquencies: [
      { address: '612 W Juniper Ct',       name: 'William & Sandra Johnson',   tag: 'Lien',     tagColor: 'red'   },
      { address: '301 N Magnolia Ave',     name: 'David Martinez',             tag: 'Lien',     tagColor: 'red'   },
      { address: '735 E Sierra Madre Ave', name: 'Robert & Patricia Thompson', tag: 'Lien',     tagColor: 'red'   },
      { address: '216 N Birch St',         name: 'Daniel & Susan Taylor',      tag: 'Pre-lien', tagColor: 'amber' },
      { address: '503 E Sycamore Blvd',   name: 'Mark & Jennifer White',      tag: 'Pre-lien', tagColor: 'amber' },
    ],
  },
}

const GROUPS = ['Monthly', 'Quarterly', 'Yearly']

/* ── Violations data ─────────────────────────────────── */
const VIOL_MONTHLY = [
  { short: 'May', total: 22 },
  { short: 'Jun', total: 28 },
  { short: 'Jul', total: 34 },
  { short: 'Aug', total: 29 },
  { short: 'Sep', total: 24 },
  { short: 'Oct', total: 21 },
  { short: 'Nov', total: 26 },
  { short: 'Dec', total: 31 },
  { short: 'Jan', total: 38 },
  { short: 'Feb', total: 25 },
  { short: 'Mar', total: 19 },
  { short: 'Apr', total: 15, current: true },
]

const VIOL_LATEST = {
  period: 'April 2026',
  total: 15,
  prevTotal: 19,
  byCategory: [
    { type: 'Parking',          count: 5, color: '#c05a35' },
    { type: 'Landscaping',      count: 4, color: '#4a7a4a' },
    { type: 'Architectural',    count: 3, color: '#9a8030' },
    { type: 'Noise / nuisance', count: 2, color: '#7a3535' },
    { type: 'Trash / bins',     count: 1, color: '#6a8a6a' },
  ],
  status: { cured: 11, open: 3, escalated: 1 },
}

function getMonthBarColor(total, isCurrent) {
  if (isCurrent) return 'var(--lime)'
  if (total >= 35) return '#804040'
  if (total >= 28) return '#c06030'
  if (total >= 22) return '#b87840'
  return '#6a8a6a'
}

const BANK_ACCOUNTS = [
  { name: 'Depository Account', balance: 284620, registered: 261480 },
  { name: 'Reserves Account',   balance: 512340, registered: 512340 },
]

const RESERVE_FUND = {
  funded: 512340,   // Reserves Account balance
  target: 607000,
  pct: Math.round(512340 / 607000 * 100),  // 84%
  qoqDelta: 2.4,
}

function fmt(n) {
  return '$' + Math.abs(n).toLocaleString()
}

export default function Pulse() {
  const navigate = useNavigate()
  const { setCephAIPulseCount, setChatOpen, setCephAICardContext } = useMode()
  const [period, setPeriod] = useState('apr-2026')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterRange, setFilterRange] = useState({ period: 'apr-2026', timeFrame: 'all', dateFrom: '', dateTo: '' })
  const [exportOpen, setExportOpen] = useState(false)
  const [violTab, setViolTab] = useState('month')
  const [showTour, setShowTour] = useState(
    () => localStorage.getItem('pulseTourDismissed') !== 'true'
  )
  const [bankTab, setBankTab] = useState('balance')
  const [holdingCard, setHoldingCard] = useState(null)
  const holdTimerRef = useRef(null)

  const data = PERIOD_DATA[period]
  const currentPeriod = PERIODS.find(p => p.key === period)
  const periodLabel = currentPeriod?.label
  const projMult = currentPeriod?.projMult ?? 1

  // Long-press to trigger CephAI
  const startHold = useCallback((cardId) => {
    cancelHold()
    setHoldingCard(cardId)
    holdTimerRef.current = setTimeout(() => {
      setHoldingCard(null)
      setCephAICardContext(cardId)
      setCephAIPulseCount(c => c + 1)
      setTimeout(() => setChatOpen(true), 1800)
    }, 2500)
  }, [setCephAIPulseCount, setChatOpen, setCephAICardContext])

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    setHoldingCard(null)
  }, [])

  // Helper: spread these onto any holdable element.
  // pointerDown/Up bubble naturally so inner button clicks still work.
  function holdProps(cardId) {
    return {
      onPointerDown: () => startHold(cardId),
      onPointerUp: cancelHold,
      onPointerLeave: cancelHold,
      onPointerCancel: cancelHold,
      onContextMenu: (e) => e.preventDefault(),
    }
  }

  const { total, categories } = data.expenses

  const violDelta    = VIOL_LATEST.total - VIOL_LATEST.prevTotal
  const violDeltaPct = Math.round((violDelta / VIOL_LATEST.prevTotal) * 100)
  const violMaxCat   = VIOL_LATEST.byCategory[0].count
  const violYTD      = VIOL_MONTHLY.slice(-4).reduce((s, m) => s + m.total, 0)
  const violPeak     = Math.max(...VIOL_MONTHLY.map(m => m.total))
  const violCurrent  = VIOL_MONTHLY[VIOL_MONTHLY.length - 1].total
  const violVsPeak   = Math.round(((violCurrent - violPeak) / violPeak) * 100)

  const hasActiveFilter = filterRange.period !== 'apr-2026' || filterRange.timeFrame === 'custom'

  function applyPulseFilter(f) {
    if (f.period) setPeriod(f.period)
    setFilterRange(f)
  }

  function handleExport() {
    setExportOpen(true)
  }

  function getTrend(c) {
    const annualBudget = ANNUAL_BUDGETS[c.name]
    if (!annualBudget) return { status: 'ok' }
    const projected = c.actual * projMult
    const pct = projected / annualBudget
    if (pct > 1.04) return { status: 'over',  projected, annualBudget, overage: projected - annualBudget }
    if (pct >= 0.94) return { status: 'risk',  projected, annualBudget }
    return { status: 'ok' }
  }

  return (
    <div className="screen">
      {showTour && <PulseTourModal onClose={() => setShowTour(false)} />}
      {filterOpen && (
        <PulseFilter
          filter={filterRange}
          onChange={applyPulseFilter}
          onClose={() => setFilterOpen(false)}
        />
      )}
      {exportOpen && (
        <ExportSheet periodLabel={periodLabel} onClose={() => setExportOpen(false)} />
      )}
      <div className="screen-inner">

        {/* Title + period selector */}
        <div className="pulse-title-row">
          <div>
            <h1 className="pulse-title">Community Pulse</h1>
            <p className="pulse-sub">{periodLabel} · Live snapshot</p>
          </div>
          <div className="pulse-title-actions">
            <button
              className={`engage-filter-btn${hasActiveFilter ? ' engage-filter-btn--active' : ''}`}
              onClick={() => setFilterOpen(true)}
            >
              <PulseSlidersIcon />
            </button>
            <button className="engage-filter-btn" onClick={handleExport} title="Export PDF">
              <PulseDownloadIcon />
            </button>
          </div>
        </div>

        {/* AT A GLANCE */}
        <div>
          <p className="section-label">At a Glance</p>
          <div className="pulse-glance-scroll">
            <div className="pulse-grid">
              {data.kpis.map((k, i) => (
                <button
                  key={k.label}
                  className={`pulse-stat card${holdingCard === `kpi:${i}` ? ' card--holding' : ''}`}
                  onClick={() => navigate(k.route)}
                  {...holdProps(`kpi:${i}`)}
                >
                  <p className="pulse-stat__label">{k.label}</p>
                  <p className="pulse-stat__value">{k.value}</p>
                  <p className={`pulse-stat__delta pulse-stat__delta--${k.deltaColor}`}>{k.delta}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BANK BALANCE / RESERVE FUND */}
        <div>
        <p className="section-label">Bank Balance / Reserve Fund Health</p>
        <div
          className={`card bank-card${holdingCard === (bankTab === 'balance' ? 'bank:balance' : 'bank:reserve') ? ' card--holding' : ''}`}
          {...holdProps(bankTab === 'balance' ? 'bank:balance' : 'bank:reserve')}
        >

          {/* Tab strip */}
          <div className="viol-tabs">
            {[['balance', 'Balance'], ['reserve', 'Reserve Fund']].map(([key, label]) => (
              <button
                key={key}
                className={`viol-tab${bankTab === key ? ' viol-tab--active' : ''}`}
                onClick={() => setBankTab(key)}
              >{label}</button>
            ))}
          </div>

          {/* ── Balance tab ── */}
          {bankTab === 'balance' && <>
            <div className="bank-card__header">
              <span className="bank-card__all-label">All Accounts</span>
            </div>
            <p className="bank-card__total">
              {fmt(BANK_ACCOUNTS.reduce((s, a) => s + a.balance, 0))}
            </p>
            <div className="bank-accounts">
              {BANK_ACCOUNTS.map((acct, i) => {
                const hasPending = acct.registered !== acct.balance
                const pendingDiff = acct.registered - acct.balance
                return (
                  <div key={acct.name} className={`bank-account${i < BANK_ACCOUNTS.length - 1 ? ' bank-account--border' : ''}`}>
                    <div className="bank-account__left">
                      <span className="bank-account__name">{acct.name}</span>
                      {hasPending && (
                        <span className={`bank-account__pending ${pendingDiff < 0 ? 'bank-account__pending--debit' : 'bank-account__pending--credit'}`}>
                          {pendingDiff < 0 ? '↓' : '↑'} {fmt(Math.abs(pendingDiff))} pending
                        </span>
                      )}
                    </div>
                    <div className="bank-account__right">
                      <span className="bank-account__balance">{fmt(acct.balance)}</span>
                      <span className="bank-account__reg-row">
                        <span className="bank-account__reg-label">Registered</span>
                        <span className="bank-account__reg-val">{fmt(acct.registered)}</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>}

          {/* ── Reserve Fund tab ── */}
          {bankTab === 'reserve' && (
            <div className="reserve-body">
              <div className="reserve-hero">
                <p className="reserve-pct">
                  <span className="reserve-pct__num">{RESERVE_FUND.pct}</span>
                  <span className="reserve-pct__unit">%</span>
                </p>
                <span className="reserve-qoq">↗ +{RESERVE_FUND.qoqDelta}pp QoQ</span>
              </div>
              <div className="reserve-bottom">
                <div className="reserve-bar">
                  <div className="reserve-bar__fill" style={{ width: `${RESERVE_FUND.pct}%` }} />
                  <div className="reserve-bar__tick" style={{ left: '33%' }} />
                  <div className="reserve-bar__tick" style={{ left: '66%' }} />
                </div>
                <div className="reserve-labels">
                  <span className="reserve-labels__funded">
                    {fmt(RESERVE_FUND.funded)}<span className="reserve-labels__word"> funded</span>
                  </span>
                  <span className="reserve-labels__target">
                    target <strong>{fmt(RESERVE_FUND.target)}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* VIOLATIONS */}
        <div>
        <p className="section-label">Violations</p>
        <div
          className={`card viol-card${holdingCard === `violations:${violTab}` ? ' card--holding' : ''}`}
          {...holdProps(`violations:${violTab}`)}
        >

          {/* Tab strip */}
          <div className="viol-tabs">
            {[['month', 'By type'], ['6mo', '6 months'], ['ytd', 'YTD']].map(([key, label]) => (
              <button
                key={key}
                className={`viol-tab${violTab === key ? ' viol-tab--active' : ''}`}
                onClick={() => setViolTab(key)}
              >{label}</button>
            ))}
          </div>

          {/* Body — fixed height, flex column */}
          <div className="viol-body">

            {/* ── By type ── */}
            {violTab === 'month' && <>
              <div className="viol-period-row">
                <span className="viol-period-name">{VIOL_LATEST.period}</span>
                <span className={`viol-delta-badge${violDelta > 0 ? ' viol-delta-badge--red' : ''}`}>
                  {violDelta > 0 ? '↗' : '↘'} {violDelta > 0 ? '+' : ''}{violDelta} ({violDeltaPct}%)
                </span>
              </div>
              <p className="viol-total-line">
                <span className="viol-total-num">{VIOL_LATEST.total}</span>
                <span className="viol-total-word"> total</span>
              </p>
              <p className="viol-cat-label">By category</p>
              <div className="viol-bars">
                {VIOL_LATEST.byCategory.map(c => (
                  <div key={c.type} className="viol-bar-row">
                    <span className="viol-bar-label">{c.type}</span>
                    <div className="viol-bar-track">
                      <div className="viol-bar-fill" style={{ width: `${(c.count / violMaxCat) * 100}%`, background: c.color }} />
                    </div>
                    <span className="viol-bar-count" style={{ color: c.color }}>{c.count}</span>
                  </div>
                ))}
              </div>
              <div className="viol-status">
                {[
                  { label: 'Cured',     val: VIOL_LATEST.status.cured,     cls: 'green'  },
                  { label: 'Open',      val: VIOL_LATEST.status.open,      cls: 'orange' },
                  { label: 'Escalated', val: VIOL_LATEST.status.escalated, cls: 'red'    },
                ].map(s => (
                  <div key={s.label} className="viol-status-item">
                    <span className="viol-status-label">{s.label}</span>
                    <span className={`viol-status-val viol-status-val--${s.cls}`}>{s.val}</span>
                  </div>
                ))}
              </div>
            </>}

            {/* ── 6 months / YTD ── */}
            {(violTab === '6mo' || violTab === 'ytd') && (() => {
              const months = violTab === '6mo' ? VIOL_MONTHLY.slice(-6) : VIOL_MONTHLY.slice(-4)
              const maxVal = Math.max(...months.map(m => m.total))
              return (
                <div className="viol-bars">
                  {months.map(m => (
                    <div key={m.short} className={`viol-bar-row${m.current ? ' viol-bar-row--current' : ''}`}>
                      <span className="viol-bar-month">{m.short}</span>
                      <div className="viol-bar-track">
                        <div className="viol-bar-fill" style={{ width: `${(m.total / maxVal) * 100}%`, background: getMonthBarColor(m.total, m.current) }} />
                      </div>
                      <span className="viol-bar-count">{m.total}</span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Footer — always visible */}
          <div className="viol-footer">
            <div className="viol-footer-item">
              <span className="viol-footer-label">YTD</span>
              <span className="viol-footer-val">{violYTD}</span>
            </div>
            <div className="viol-footer-item">
              <span className="viol-footer-label">VS Jan peak</span>
              <span className="viol-footer-val viol-footer-val--good">{violVsPeak}%</span>
            </div>
            <div className="viol-footer-item">
              <span className="viol-footer-label">Trend</span>
              <TrendSparkline data={VIOL_MONTHLY.slice(-8).map(m => m.total)} />
            </div>
          </div>

          <button className="card-cta" onClick={() => navigate('/pulse/violations')}>
            See all violations <ChevronRightIcon />
          </button>
        </div>
        </div>

        {/* TOP DELINQUENCIES */}
        <div>
          <p className="section-label">Top Delinquencies</p>
          <div
            className={`delinquency-list card${holdingCard === 'delinquencies' ? ' card--holding' : ''}`}
            {...holdProps('delinquencies')}
          >
            {data.delinquencies.map((d, i) => (
              <button
                key={d.name}
                className={`delinquency-row delinquency-row--border`}
                onClick={() => navigate('/pulse/delinquency')}
              >
                <div className="delinquency-row__info">
                  <p className="delinquency-row__address">{d.address}</p>
                  <p className="delinquency-row__name">{d.name}</p>
                </div>
                <span className={`delinquency-tag delinquency-tag--${d.tagColor}`}>{d.tag}</span>
              </button>
            ))}
            <button className="card-cta" onClick={() => navigate('/pulse/delinquency')}>
              See all <ChevronRightIcon />
            </button>
          </div>
        </div>

        {/* EXPENSES VS BUDGET */}
        <div>
        <p className="section-label">Expenses vs Budget</p>
        <div
          className={`card expenses-card${holdingCard === 'expenses' ? ' card--holding' : ''}`}
          {...holdProps('expenses')}
        >
          <div className="expenses-list">
            {categories.map((c, i) => {
              const trend = getTrend(c)
              const variance = c.actual - c.budget
              const over = variance > 0
              return (
                <div key={c.name} className={`expenses-row${i < categories.length - 1 ? ' expenses-row--border' : ''}`}>
                  <div className="expenses-row__left">
                    <span className="expenses-row__name">{c.name}</span>
                    {trend.status === 'over' && (
                      <span className="expenses-row__proj expenses-row__proj--red">
                        On pace for {fmt(trend.projected)} — {fmt(trend.overage)} over annual budget
                      </span>
                    )}
                    {trend.status === 'risk' && (
                      <span className="expenses-row__proj expenses-row__proj--amber">
                        On pace for {fmt(trend.projected)} of {fmt(trend.annualBudget)} annual budget
                      </span>
                    )}
                  </div>
                  <span className="expenses-row__actual">{fmt(c.actual)}</span>
                  <span className={`expenses-row__pill expenses-row__pill--${trend.status === 'over' ? 'red' : trend.status === 'risk' ? 'amber' : variance < 0 ? 'green' : 'muted'}`}>
                    {trend.status === 'over'  ? '⚠ Over'     :
                     trend.status === 'risk'  ? '⚠ At risk'  :
                     variance === 0           ? 'On budget'  :
                     variance < 0             ? 'On track'   : 'On track'}
                  </span>
                </div>
              )
            })}
          </div>
          <button className="card-cta" onClick={() => navigate('/pulse/budget')}>
            See full report <ChevronRightIcon />
          </button>
        </div>
        </div>

        {/* APPROVED INVOICES */}
        <div>
        <p className="section-label">Approved to Pay Invoices</p>
        <div
          className={`card invoices-card${holdingCard === 'invoices' ? ' card--holding' : ''}`}
          {...holdProps('invoices')}
        >
          <div className="invoices-card__header">
            <span className="invoices-count">{data.invoices.count} invoices</span>
          </div>
          <p className="invoices-total">{fmt(data.invoices.total)}</p>
          <div className="invoices-list">
            {data.invoices.items.map((inv, i) => (
              <div
                key={inv.vendor}
                className={`invoices-row${i < data.invoices.items.length - 1 ? ' invoices-row--border' : ''}`}
              >
                <span className="invoices-row__vendor">{inv.vendor}</span>
                <span className="invoices-row__amount">{fmt(inv.amount)}</span>
              </div>
            ))}
          </div>
          <button className="card-cta" onClick={() => navigate('/pulse/invoices')}>
            See all invoices <ChevronRightIcon />
          </button>
        </div>
        </div>

      </div>
    </div>
  )
}

function TrendSparkline({ data, width = 64, height = 24 }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const last = pts.split(' ').at(-1).split(',')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="var(--lime)" />
    </svg>
  )
}

/* ── Pulse Filter ─────────────────────────────────── */
const PULSE_MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function pulseFmtDate(ds) {
  if (!ds) return null
  const [,m,d] = ds.split('-')
  return `${PULSE_MONTH_LABELS[parseInt(m)-1]} ${parseInt(d)}`
}
const PULSE_CAL_MONTHS = ['January','February','March','April']
const PULSE_CAL_MIN = '2025-01-01'
const PULSE_CAL_MAX = '2026-04-26'

function PulseCalendar({ selecting, dateFrom, dateTo, onSelect }) {
  const initMonth = dateFrom ? parseInt(dateFrom.slice(5, 7)) - 1
                  : dateTo   ? parseInt(dateTo.slice(5, 7)) - 1
                  : 3
  const [viewYear, setViewYear]   = useState(dateFrom ? parseInt(dateFrom.slice(0,4)) : 2026)
  const [viewMonth, setViewMonth] = useState(Math.min(Math.max(initMonth, 0), 3))

  const minDate = PULSE_CAL_MIN
  const maxDate = PULSE_CAL_MAX

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay()

  function fmt(d) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(fmt(d))

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const atMin = viewMonth === 0 && viewYear <= parseInt(minDate.slice(0,4))
  const atMax = fmt(daysInMonth) >= maxDate

  return (
    <div className="mini-cal">
      <div className="mini-cal__nav">
        <button className="mini-cal__nav-btn" disabled={atMin} onClick={prevMonth}>‹</button>
        <span className="mini-cal__month">{monthLabel}</span>
        <button className="mini-cal__nav-btn" disabled={atMax} onClick={nextMonth}>›</button>
      </div>
      <div className="mini-cal__weekdays">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="mini-cal__wd">{d}</div>)}
      </div>
      <div className="mini-cal__grid">
        {cells.map((ds, i) => {
          if (!ds) return <div key={`e${i}`} className="mini-cal__cell mini-cal__cell--empty" />
          const disabled  = ds < minDate || ds > maxDate
          const isFrom    = ds === dateFrom
          const isTo      = ds === dateTo
          const inRange   = dateFrom && dateTo && ds > dateFrom && ds < dateTo
          const cls = ['mini-cal__cell',
            disabled  ? 'mini-cal__cell--disabled' : '',
            isFrom    ? 'mini-cal__cell--from'     : '',
            isTo      ? 'mini-cal__cell--to'       : '',
            inRange   ? 'mini-cal__cell--range'    : '',
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

function PulseFilter({ filter, onChange, onClose }) {
  const [draft, setDraft] = useState({ ...filter })
  const [view, setView]   = useState('main')
  const [selecting, setSelecting] = useState('from')

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

  function handleApply() { onChange(draft); onClose() }

  function handleClear() {
    const cleared = { period: 'apr-2026', timeFrame: 'all', dateFrom: '', dateTo: '' }
    onChange(cleared)
    onClose()
  }

  const customLabel = draft.timeFrame === 'custom' && draft.dateFrom
    ? `${pulseFmtDate(draft.dateFrom)} – ${pulseFmtDate(draft.dateTo) || '?'}`
    : 'Custom Range'

  const mainView = (
    <>
      <div className="filter-sheet__handle" />
      <div className="filter-sheet__header">
        <span className="filter-sheet__title">Filter Report</span>
        <button className="filter-sheet__close" onClick={onClose}><PulseCloseIcon /></button>
      </div>

      {GROUPS.map(group => (
        <div className="filter-section" key={group}>
          <p className="filter-section__label">{group}</p>
          <div className="filter-chips">
            {PERIODS.filter(p => p.group === group).map(p => (
              <button
                key={p.key}
                className={`filter-chip${draft.period === p.key && draft.timeFrame !== 'custom' ? ' filter-chip--active' : ''}`}
                onClick={() => setDraft(d => ({ ...d, period: p.key, timeFrame: 'all', dateFrom: '', dateTo: '' }))}
              >{p.label}</button>
            ))}
          </div>
        </div>
      ))}

      <div className="filter-section">
        <p className="filter-section__label">Custom Date Range</p>
        <div className="filter-chips">
          <button
            className={`filter-chip filter-chip--nav${draft.timeFrame === 'custom' ? ' filter-chip--active' : ''}`}
            onClick={() => { setDraft(d => ({ ...d, timeFrame: 'custom' })); setView('custom') }}
          >
            {customLabel}
            <PulseChevronRightSmallIcon />
          </button>
        </div>
      </div>

      <button className="filter-apply" onClick={handleApply}>Apply Filter</button>
      <button className="filter-clear" onClick={handleClear}>Reset to Default</button>
    </>
  )

  const customView = (
    <>
      <div className="filter-sheet__handle" />
      <div className="filter-sheet__header">
        <button className="filter-sheet__back" onClick={() => setView('main')}>
          <PulseBackIcon />
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
          {pulseFmtDate(draft.dateFrom)
            ? <span className="filter-date-btn__value">{pulseFmtDate(draft.dateFrom)}</span>
            : <span className="filter-date-btn__value filter-date-btn__value--placeholder">Select</span>}
        </button>
        <span className="filter-date-arrow">→</span>
        <button
          className={`filter-date-btn${selecting === 'to' ? ' filter-date-btn--active' : ''}`}
          onClick={() => setSelecting('to')}
        >
          <span className="filter-date-btn__label">To</span>
          {pulseFmtDate(draft.dateTo)
            ? <span className="filter-date-btn__value">{pulseFmtDate(draft.dateTo)}</span>
            : <span className="filter-date-btn__value filter-date-btn__value--placeholder">Select</span>}
        </button>
      </div>
      <PulseCalendar
        selecting={selecting}
        dateFrom={draft.dateFrom}
        dateTo={draft.dateTo}
        onSelect={handleCalSelect}
      />
      <button className="filter-apply" onClick={applyCustomRange}>Apply Date Range</button>
      <button className="filter-clear" onClick={() => setDraft(d => ({ ...d, dateFrom: '', dateTo: '' }))}>Clear Dates</button>
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

/* ── Pulse Icons ──────────────────────────────────── */
function PulseSlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
      <line x1="4" y1="12" x2="20" y2="12"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <line x1="4" y1="18" x2="20" y2="18"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>
  )
}
function PulseDownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function PulseCloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function PulseBackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  )
}
function PulseChevronRightSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

function ChevronDownIcon({ open }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

const EXPORT_OPTIONS = [
  {
    id: 'pdf',
    label: 'Download PDF',
    sub: 'Formatted report ready to print or share',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
      </svg>
    ),
    action: () => window.print(),
  },
  {
    id: 'csv',
    label: 'Download CSV',
    sub: 'Raw data for spreadsheet analysis',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="9" x2="9" y2="21"/><line x1="15" y1="9" x2="15" y2="21"/>
      </svg>
    ),
    action: () => alert('CSV export coming soon'),
  },
  {
    id: 'word',
    label: 'Download Word',
    sub: 'Editable .docx document',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    action: () => alert('Word export coming soon'),
  },
  {
    id: 'email',
    label: 'Send by Email',
    sub: 'Share report with board members',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    action: () => alert('Email share coming soon'),
  },
]

function ExportSheet({ periodLabel, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="filter-sheet-wrap">
      <div className="filter-scrim" onClick={onClose} />
      <div className="filter-sheet export-sheet">
        <div className="filter-sheet__header">
          <span className="filter-sheet__title">Export Report</span>
          <button className="filter-sheet__close" onClick={onClose}><PulseCloseIcon /></button>
        </div>
        <p className="export-sheet__sub">{periodLabel} · Community Pulse</p>
        <div className="export-options">
          {EXPORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className="export-option"
              onClick={() => { opt.action(); onClose() }}
            >
              <span className="export-option__icon">{opt.icon}</span>
              <span className="export-option__text">
                <span className="export-option__label">{opt.label}</span>
                <span className="export-option__sub">{opt.sub}</span>
              </span>
              <PulseChevronRightSmallIcon />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
