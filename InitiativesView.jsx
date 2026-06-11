import React from 'react'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const NAV = [
  { id:'today', label:'Today', icon:'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 3h2v-2h-2zm0 4h2v-2h-2zm4-4h-2v2h2zm0 4h-2v2h2zm-4 0h2v-2h-2zm0-2v-2h2v2h2v2h-4z' },
  { id:'meetings', label:'Meetings', icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { id:'deliverables', label:'Deliverables', icon:'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { id:'tasks', label:'Tasks', icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4' },
  { id:'people', label:'People', icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
  { id:'initiatives', label:'Initiatives', icon:'M13 2L3 14h9l-1 8 10-12h-9l1-8' },
  { id:'weekly', label:'Weekly recap', icon:'M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3' },
]

export default function Sidebar({ view, setView, openDelCount, openTaskCount }) {
  const d = new Date()
  return (
    <div style={{ width:220, flexShrink:0, background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>PM Dashboard</div>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text3)', marginTop:4 }}>
          {DAYS[d.getDay()].toUpperCase()} · {MONTHS[d.getMonth()].slice(0,3).toUpperCase()} {d.getDate()}
        </div>
      </div>
      <nav style={{ padding:'12px 8px', flex:1, overflowY:'auto' }}>
        {NAV.map(item => (
          <div key={item.id} onClick={() => setView(item.id)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:13,
              color:view===item.id?'var(--accent)':'var(--text2)',
              background:view===item.id?'var(--accent-bg)':'transparent', transition:'all 0.1s', userSelect:'none' }}
            onMouseEnter={e=>{ if(view!==item.id) e.currentTarget.style.background='var(--surface2)' }}
            onMouseLeave={e=>{ if(view!==item.id) e.currentTarget.style.background='transparent' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d={item.icon}/>
            </svg>
            <span>{item.label}</span>
            {item.id==='deliverables' && openDelCount>0 && <span style={{ marginLeft:'auto', background:'var(--accent-bg)', color:'var(--accent)', fontSize:10, fontWeight:500, padding:'1px 6px', borderRadius:10, fontFamily:'var(--mono)' }}>{openDelCount}</span>}
            {item.id==='tasks' && openTaskCount>0 && <span style={{ marginLeft:'auto', background:'var(--amber-bg)', color:'var(--amber)', fontSize:10, fontWeight:500, padding:'1px 6px', borderRadius:10, fontFamily:'var(--mono)' }}>{openTaskCount}</span>}
          </div>
        ))}
      </nav>
    </div>
  )
}
