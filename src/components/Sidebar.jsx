import React from 'react'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const NAV = [
  { id: 'today', label: 'Today', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { id: 'meetings', label: 'Meetings', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'deliverables', label: 'Deliverables', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { id: 'people', label: 'People', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { id: 'weekly', label: 'Weekly recap', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
]

export default function Sidebar({ view, setView, openDelCount }) {
  const d = new Date()
  return (
    <div style={{ width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>PM Dashboard</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
          {DAYS[d.getDay()].toUpperCase()} · {MONTHS[d.getMonth()].slice(0,3).toUpperCase()} {d.getDate()}
        </div>
      </div>
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {NAV.map(item => (
          <div
            key={item.id}
            onClick={() => setView(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 8px', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', fontSize: 13,
              color: view === item.id ? 'var(--accent)' : 'var(--text2)',
              background: view === item.id ? 'var(--accent-bg)' : 'transparent',
              transition: 'all 0.1s', userSelect: 'none',
            }}
            onMouseEnter={e => { if (view !== item.id) e.currentTarget.style.background = 'var(--surface2)' }}
            onMouseLeave={e => { if (view !== item.id) e.currentTarget.style.background = 'transparent' }}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.id === 'deliverables' && openDelCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 10, fontFamily: 'var(--mono)' }}>
                {openDelCount}
              </span>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
