import React, { useState } from 'react'
import { getWeekBounds, getMeetingTag } from '../lib/utils'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmt(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr+'T00:00:00')
  return MONTHS[d.getMonth()]+' '+d.getDate()
}

export default function WeeklyView({ meetings, deliverables, actionItems, initiatives }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const { start, end, startDate, endDate } = getWeekBounds(weekOffset)

  const weekMeetings = meetings.filter(m => m.date >= start && m.date <= end)
  const completedDels = deliverables.filter(d => d.status==='done')

  const nextWeek = getWeekBounds(weekOffset+1)
  const nextDue = deliverables.filter(d => d.due && d.due >= nextWeek.start && d.due <= nextWeek.end && d.status!=='done')

  const today = new Date().toISOString().slice(0,10)
  const overdue = deliverables.filter(d => d.due && d.due < today && d.status!=='done')

  const myDoneActions = actionItems.filter(a => a.done && a.owner?.toLowerCase().includes('andres'))

  // Hours by initiative
  const hoursByInit = {}
  weekMeetings.forEach(m => {
    if (m.hours && m.initiative_id) {
      hoursByInit[m.initiative_id] = (hoursByInit[m.initiative_id]||0) + parseFloat(m.hours||0)
    }
  })
  const totalHours = weekMeetings.reduce((s,m) => s + parseFloat(m.hours||0), 0)

  const isCurrentWeek = weekOffset === 0

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:18 }}>
      {/* Week nav */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:20, fontWeight:500 }}>Weekly recap</div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          <button className="btn btn-sm" onClick={()=>setWeekOffset(weekOffset-1)}>← Prev</button>
          <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--text2)', minWidth:160, textAlign:'center' }}>
            {fmt(start)} – {fmt(end)} {isCurrentWeek && <span style={{ color:'var(--accent)' }}>(this week)</span>}
          </div>
          <button className="btn btn-sm" onClick={()=>setWeekOffset(weekOffset+1)} disabled={isCurrentWeek}>Next →</button>
          {!isCurrentWeek && <button className="btn btn-sm btn-primary" onClick={()=>setWeekOffset(0)}>Today</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Meetings', val:weekMeetings.length, color:'var(--accent)' },
          { label:'Hours logged', val:totalHours.toFixed(1), color:'var(--teal)' },
          { label:'Actions completed', val:myDoneActions.length, color:'var(--green)' },
          { label:'Overdue', val:overdue.length, color:overdue.length>0?'var(--red)':'var(--text3)' },
        ].map(s=>(
          <div key={s.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px 16px' }}>
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:26, fontWeight:500, color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Capitalizable hours by initiative */}
      {Object.keys(hoursByInit).length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">💰 Capitalizable hours by initiative</div></div>
          {Object.entries(hoursByInit).map(([initId, hours]) => {
            const init = initiatives.find(i=>i.id===initId)
            return (
              <div key={initId} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ flex:1, fontSize:13, color:'var(--text)' }}>{init?.name||'Unknown initiative'}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:14, fontWeight:500, color:'var(--green)' }}>{hours.toFixed(1)}h</div>
              </div>
            )
          })}
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:8 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--text2)' }}>Total: <span style={{ color:'var(--green)', fontWeight:500 }}>{totalHours.toFixed(1)}h</span></div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* This week's meetings */}
        <div className="card">
          <div className="card-header"><div className="card-title">Meetings this week</div></div>
          {weekMeetings.length===0 ? (
            <div className="empty">No meetings logged</div>
          ) : weekMeetings.sort((a,b)=>a.date.localeCompare(b.date)).map(m => {
            const [label,cls] = getMeetingTag(m.type)
            return (
              <div key={m.id} style={{ padding:'8px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:'var(--text)' }}>{m.title}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:2 }}>{m.date}{m.hours>0?' · '+m.hours+'h':''}</div>
                </div>
                <span className={`tag ${cls}`}>{label}</span>
              </div>
            )
          })}
        </div>

        {/* Due next week */}
        <div className="card">
          <div className="card-header"><div className="card-title">Due next week</div></div>
          {nextDue.length===0 ? (
            <div className="empty">Nothing due next week</div>
          ) : nextDue.map(d=>(
            <div key={d.id} style={{ padding:'8px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:'var(--text)' }}>{d.title}</div>
                <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:2 }}>{d.due}{d.deliver_to?' · '+d.deliver_to:''}</div>
              </div>
              <span className={`priority p-${d.priority||'med'}`}>{d.priority||'med'}</span>
            </div>
          ))}
        </div>

        {/* Overdue */}
        {overdue.length>0 && (
          <div className="card" style={{ borderColor:'rgba(248,113,113,0.2)' }}>
            <div className="card-header"><div className="card-title" style={{ color:'var(--red)' }}>⚠ Overdue</div></div>
            {overdue.map(d=>(
              <div key={d.id} style={{ padding:'8px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:'var(--text)' }}>{d.title}</div>
                  <div style={{ fontSize:11, color:'var(--red)', fontFamily:'var(--mono)', marginTop:2 }}>was due {d.due}</div>
                </div>
                <span className={`priority p-${d.priority||'med'}`}>{d.priority||'med'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Completed */}
        <div className="card">
          <div className="card-header"><div className="card-title">✅ Completed deliverables</div></div>
          {completedDels.length===0 ? (
            <div className="empty">Nothing marked done yet</div>
          ) : completedDels.map(d=>(
            <div key={d.id} style={{ padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:13, color:'var(--text2)', textDecoration:'line-through' }}>{d.title}</div>
              {d.deliver_to && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>→ {d.deliver_to}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
