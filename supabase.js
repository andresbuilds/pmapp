import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_STATUS_CLS } from '../lib/utils'

export default function TasksView({ actionItems, meetings, deliverables, people, onRefresh }) {
  const [filterOwner, setFilterOwner] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSource, setFilterSource] = useState('all')

  const allTasks = actionItems.map(a => {
    const meeting = a.meeting_id ? meetings.find(m=>m.id===a.meeting_id) : null
    const deliverable = a.deliverable_id ? deliverables.find(d=>d.id===a.deliverable_id) : null
    return { ...a, meetingTitle: meeting?.title, deliverableTitle: deliverable?.title }
  })

  const filtered = allTasks.filter(t => {
    if (filterOwner && t.owner !== filterOwner) return false
    if (filterStatus !== 'all' && (t.status||'todo') !== filterStatus) return false
    if (filterSource === 'meetings' && !t.meeting_id) return false
    if (filterSource === 'deliverables' && !t.deliverable_id) return false
    return true
  })

  const owners = [...new Set(actionItems.map(a=>a.owner).filter(Boolean))]

  async function updateStatus(id, status) {
    await supabase.from('action_items').update({ status, done: status==='done' }).eq('id', id)
    onRefresh()
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ fontSize:20, fontWeight:500 }}>Tasks</div>

      {/* Filters */}
      <div className="card" style={{ padding:'12px 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          <div>
            <label>Owner</label>
            <select value={filterOwner} onChange={e=>setFilterOwner(e.target.value)}>
              <option value="">All owners</option>
              {owners.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label>Status</label>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {TASK_STATUSES.map(s=><option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label>Source</label>
            <select value={filterSource} onChange={e=>setFilterSource(e.target.value)}>
              <option value="all">All</option>
              <option value="meetings">From meetings</option>
              <option value="deliverables">From deliverables</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {TASK_STATUSES.map(s => {
          const count = allTasks.filter(t=>(t.status||'todo')===s).length
          return (
            <div key={s} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px 16px' }}>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6 }}>{TASK_STATUS_LABELS[s]}</div>
              <div style={{ fontSize:26, fontWeight:500, color: s==='done'?'var(--green)':s==='in-progress'?'var(--accent)':'var(--text2)' }}>{count}</div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {filtered.length===0 ? (
          <div className="empty" style={{ padding:32 }}>No tasks found</div>
        ) : filtered.map((t,i) => (
          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderBottom:i<filtered.length-1?'1px solid var(--border)':'none' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:'var(--text)', textDecoration:t.status==='done'?'line-through':'none', opacity:t.status==='done'?0.6:1 }}>{t.text}</div>
              <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:2 }}>
                {t.meetingTitle && <span>📅 {t.meetingTitle}</span>}
                {t.deliverableTitle && <span>📦 {t.deliverableTitle}</span>}
              </div>
            </div>
            {t.owner && <span style={{ fontSize:11, color:'var(--text2)', background:'var(--surface2)', padding:'2px 8px', borderRadius:10, flexShrink:0 }}>{t.owner}</span>}
            <select value={t.status||'todo'} onChange={e=>updateStatus(t.id,e.target.value)} style={{ fontSize:11, padding:'3px 8px', width:'auto', flexShrink:0 }}>
              {TASK_STATUSES.map(s=><option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
