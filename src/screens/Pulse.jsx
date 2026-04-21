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
  const [open, setOpen] = useState(false)
  const [violTab, setViolTab] = useState('month')
  const [showTour, setShowTour] = useState(
    () => localStorage.getItem('pulseTourDismissed') !== 'true'
  )
  const [bankTab, setBankTab] = useState('balance')
  const [holdingCard, setHoldingCard] = useState(null)
  const dropdownRef = useRef(null)
  const holdTimerRef = useRef(null)

  const data = PERIOD_DATA[period]
  const currentPeriod = PERIODS.find(p => p.key === period)
  const periodLabel = currentPeriod?.label
  const projMult = currentPeriod?.projMult ?? 1

  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

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
      <div className="screen-inner">

        {/* Title + period selector */}
        <div className="pulse-title-row">
          <div>
            <h1 className="pulse-title">Community Pulse</h1>
            <p className="pulse-sub">Live snapshot, updated continuously</p>
          </div>
          <div className="period-dropdown" ref={dropdownRef}>
            <button
              className={`period-trigger${open ? ' period-trigger--open' : ''}`}
              onClick={() => setOpen(o => !o)}
            >
              <span>{periodLabel}</span>
              <ChevronDownIcon open={open} />
            </button>
            {open && (
              <div className="period-menu">
                {GROUPS.map(group => (
                  <div key={group}>
                    <p className="period-menu__group">{group}</p>
                    {PERIODS.filter(p => p.group === group).map(p => (
                      <button
                        key={p.key}
                        className={`period-menu__item${p.key === period ? ' period-menu__item--active' : ''}`}
                        onClick={() => { setPeriod(p.key); setOpen(false) }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
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
