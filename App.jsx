import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { fmtDate, getMeetingTag } from '../lib/utils'

const EMPTY_FORM = { title:'', date:fmtDate(new Date()), time:'', type:'adhoc', attendee_ids:[], goal:'', notes:'', decisions:'', project_id:'', initiative_id:'', hours:0 }
const EMPTY_AI = [{ owner_id:'', owner_name:'', text:'' }]

export default function MeetingsView({ meetings, actionItems, people, initiatives, projects, onRefresh }) {
  const [view, setView] = useState('list') // list | form | detail
  const [form, setForm] = useState(EMPTY_FORM)
  const [ais, setAis] = useState(EMPTY_AI)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [filters, setFilters] = useState({ type:'all', person:'', initiative:'', dateFrom:'', dateTo:'' })

  const filtered = meetings.filter(m => {
    if (filters.type !== 'all' && m.type !== filters.type) return false
    if (filters.initiative && m.initiative_id !== filters.initiative) return false
    if (filters.person && !m.attendees?.some(a => a.toLowerCase().includes(filters.person.toLowerCase()))) return false
    if (filters.dateFrom && m.date < filters.dateFrom) return false
    if (filters.dateTo && m.date > filters.dateTo) return false
    return true
  }).sort((a,b) => b.date.localeCompare(a.date) || (b.time||'').localeCompare(a.time||''))

  function openNew() {
    setForm(EMPTY_FORM); setAis(EMPTY_AI); setEditing(false); setSelected(null); setView('form')
  }

  function openEdit(m) {
    setForm({
      title:m.title, date:m.date, time:m.time||'', type:m.type||'adhoc',
      attendee_ids: [], goal:m.goal||'', notes:m.notes||'', decisions:m.decisions||'',
      project_id:m.project_id||'', initiative_id:m.initiative_id||'', hours:m.hours||0
    })
    const mActions = actionItems.filter(a => a.meeting_id === m.id)
    setAis(mActions.length > 0 ? mActions.map(a => ({ owner_id:'', owner_name:a.owner||'', text:a.text })) : EMPTY_AI)
    setEditing(true); setSelected(m); setView('form')
  }

  async function save() {
    setSaving(true)
    const attendeeNames = form.attendee_ids.map(id => people.find(p=>p.id===id)?.name).filter(Boolean)
    const payload = {
      title:form.title, date:form.date, time:form.time||null, type:form.type,
      attendees: attendeeNames, goal:form.goal, notes:form.notes, decisions:form.decisions,
      project_id:form.project_id||null, initiative_id:form.initiative_id||null, hours:parseFloat(form.hours)||0
    }
    let meetId = selected?.id
    if (editing && meetId) {
      await supabase.from('meetings').update(payload).eq('id', meetId)
      await supabase.from('action_items').delete().eq('meeting_id', meetId)
    } else {
      const { data } = await supabase.from('meetings').insert(payload).select().single()
      meetId = data?.id
    }
    if (meetId) {
      const validAis = ais.filter(a => a.text.trim())
      if (validAis.length > 0) {
        await supabase.from('action_items').insert(validAis.map(a => ({ text:a.text, owner:a.owner_name||a.owner_id, meeting_id:meetId, status:'todo' })))
      }
    }
    setSaving(false); setView('list'); onRefresh()
  }

  async function deleteMeeting(id) {
    await supabase.from('meetings').delete().eq('id', id)
    setView('list'); onRefresh()
  }

  async function toggleAction(id, done) {
    await supabase.from('action_items').update({ done:!done, status: done?'todo':'done' }).eq('id', id)
    onRefresh()
  }

  const selectedActions = selected ? actionItems.filter(a => a.meeting_id === selected.id) : []
  const filtProjects = form.initiative_id ? projects.filter(p => p.initiative_id === form.initiative_id) : projects

  // DETAIL VIEW
  if (view === 'detail' && selected) {
    const [label, cls] = getMeetingTag(selected.type)
    const init = initiatives.find(i => i.id === selected.initiative_id)
    const proj = projects.find(p => p.id === selected.project_id)
    return (
      <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:16, maxWidth:860, margin:'0 auto', width:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn btn-sm" onClick={() => setView('list')}>← Back</button>
          <div style={{ flex:1 }} />
          <button className="btn btn-sm" onClick={() => openEdit(selected)}>Edit</button>
          <button className="btn btn-sm btn-danger" onClick={() => deleteMeeting(selected.id)}>Delete</button>
        </div>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
            <span className={`tag ${cls}`}>{label}</span>
            {init && <span style={{ fontSize:12, color:'var(--text3)' }}>{init.name}</span>}
            {proj && <span style={{ fontSize:12, color:'var(--accent)' }}>/ {proj.name}</span>}
          </div>
          <div style={{ fontSize:24, fontWeight:500, color:'var(--text)', marginBottom:4 }}>{selected.title}</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--text3)' }}>
            {selected.date}{selected.time ? ' · '+selected.time : ''}{selected.hours ? ' · '+selected.hours+'h' : ''}
            {selected.attendees?.length ? ' · '+selected.attendees.join(', ') : ''}
          </div>
        </div>

        {selected.goal && (
          <div className="card">
            <div className="card-title" style={{ marginBottom:8 }}>Goal / context</div>
            <div style={{ fontSize:14, color:'var(--text2)' }}>{selected.goal}</div>
          </div>
        )}

        {selected.notes && (
          <div className="card">
            <div className="card-title" style={{ marginBottom:8 }}>Notes</div>
            <div style={{ fontSize:14, color:'var(--text2)', whiteSpace:'pre-wrap', lineHeight:1.7 }}>{selected.notes}</div>
          </div>
        )}

        {selected.decisions && (
          <div className="card">
            <div className="card-title" style={{ marginBottom:8 }}>Decisions made</div>
            <div style={{ fontSize:14, color:'var(--text2)', whiteSpace:'pre-wrap' }}>{selected.decisions}</div>
          </div>
        )}

        {selectedActions.length > 0 && (
          <div className="card">
            <div className="card-title" style={{ marginBottom:12 }}>Action items</div>
            {selectedActions.map(a => (
              <div key={a.id} className="action-item-row">
                <div className={`checkbox ${a.done?'checked':''}`} onClick={() => toggleAction(a.id, a.done)} />
                <span style={{ flex:1, fontSize:13, color:'var(--text)', textDecoration:a.done?'line-through':'none', opacity:a.done?0.5:1 }}>{a.text}</span>
                {a.owner && <span style={{ fontSize:11, color:'var(--text3)', background:'var(--surface2)', padding:'1px 8px', borderRadius:10 }}>{a.owner}</span>}
                <span className={`tag tag-${a.status==='done'?'stakeholder':a.status==='in-progress'?'oneone':'adhoc'}`}>{a.status||'todo'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // FORM VIEW
  if (view === 'form') {
    return (
      <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:16, maxWidth:760, margin:'0 auto', width:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn btn-sm" onClick={() => setView('list')}>← Back</button>
          <div style={{ fontSize:18, fontWeight:500 }}>{editing ? 'Edit meeting' : 'Log a meeting'}</div>
        </div>

        <div className="card">
          <div className="form-row"><label>Title *</label><input type="text" placeholder="e.g. 1:1 Tyler Bisbee" value={form.title} onChange={e => setForm({...form,title:e.target.value})} /></div>
          <div className="form-grid form-row">
            <div><label>Date *</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} /></div>
            <div><label>Time</label><input type="time" value={form.time} onChange={e => setForm({...form,time:e.target.value})} /></div>
          </div>
          <div className="form-grid form-row">
            <div>
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                <option value="adhoc">Ad hoc</option>
                <option value="1-on-1">1:1</option>
                <option value="standup">Standup</option>
                <option value="stakeholder">Stakeholder</option>
                <option value="external">External</option>
              </select>
            </div>
            <div><label>Hours logged</label><input type="number" min="0" step="0.25" value={form.hours} onChange={e => setForm({...form,hours:e.target.value})} /></div>
          </div>
          <div className="form-grid form-row">
            <div>
              <label>Initiative</label>
              <select value={form.initiative_id} onChange={e => setForm({...form,initiative_id:e.target.value,project_id:''})}>
                <option value="">None</option>
                {initiatives.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label>Project</label>
              <select value={form.project_id} onChange={e => setForm({...form,project_id:e.target.value})}>
                <option value="">None</option>
                {filtProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* People picker */}
          <div className="form-row">
            <label>Attendees</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:6 }}>
              {people.map(p => {
                const sel = form.attendee_ids.includes(p.id)
                return (
                  <div key={p.id} onClick={() => {
                    const ids = sel ? form.attendee_ids.filter(id=>id!==p.id) : [...form.attendee_ids, p.id]
                    setForm({...form, attendee_ids:ids})
                  }} style={{ padding:'4px 10px', borderRadius:20, fontSize:12, cursor:'pointer', border:`1px solid ${sel?'var(--accent)':'var(--border2)'}`, background:sel?'var(--accent-bg)':'transparent', color:sel?'var(--accent)':'var(--text2)' }}>
                    {p.name}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="form-row"><label>Goal / context</label><input type="text" placeholder="What is this meeting about?" value={form.goal} onChange={e => setForm({...form,goal:e.target.value})} /></div>
        </div>

        <div className="card">
          <div className="form-row">
            <label>Notes</label>
            <textarea placeholder="Key discussion points, observations, context…" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} style={{ minHeight:200, lineHeight:1.7 }} />
          </div>
          <div className="form-row">
            <label>Decisions made</label>
            <textarea placeholder="What was decided?" value={form.decisions} onChange={e => setForm({...form,decisions:e.target.value})} style={{ minHeight:80 }} />
          </div>
        </div>

        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div className="card-title">Action items</div>
            <button className="btn btn-sm" onClick={() => setAis([...ais,{owner_id:'',owner_name:'',text:''}])}>+ Add</button>
          </div>
          {ais.map((ai,i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
              <select value={ai.owner_id} onChange={e => { const n=[...ais]; const p=people.find(x=>x.id===e.target.value); n[i]={...n[i],owner_id:e.target.value,owner_name:p?.name||''}; setAis(n) }} style={{ width:140, flexShrink:0 }}>
                <option value="">Owner</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="text" placeholder="Action item…" value={ai.text} onChange={e => { const n=[...ais]; n[i]={...n[i],text:e.target.value}; setAis(n) }} />
              {ais.length > 1 && <button className="btn btn-sm" onClick={() => setAis(ais.filter((_,j)=>j!==i))}>×</button>}
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button className="btn" onClick={() => setView('list')}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving||!form.title}>{saving?'Saving…':'Save meeting'}</button>
        </div>
      </div>
    )
  }

  // LIST VIEW
  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:20, fontWeight:500 }}>Meetings</div>
        <button className="btn btn-primary" onClick={openNew}>+ Log meeting</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'12px 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
          <div>
            <label>Type</label>
            <select value={filters.type} onChange={e => setFilters({...filters,type:e.target.value})}>
              <option value="all">All types</option>
              <option value="1-on-1">1:1</option>
              <option value="standup">Standup</option>
              <option value="stakeholder">Stakeholder</option>
              <option value="external">External</option>
              <option value="adhoc">Ad hoc</option>
            </select>
          </div>
          <div>
            <label>Initiative</label>
            <select value={filters.initiative} onChange={e => setFilters({...filters,initiative:e.target.value})}>
              <option value="">All</option>
              {initiatives.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label>Person</label>
            <select value={filters.person} onChange={e => setFilters({...filters,person:e.target.value})}>
              <option value="">All</option>
              {people.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div><label>From</label><input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters,dateFrom:e.target.value})} /></div>
          <div><label>To</label><input type="date" value={filters.dateTo} onChange={e => setFilters({...filters,dateTo:e.target.value})} /></div>
        </div>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty" style={{ padding:32 }}>No meetings found</div>
        ) : filtered.map((m,i) => {
          const [label,cls] = getMeetingTag(m.type)
          const mActions = actionItems.filter(a => a.meeting_id === m.id)
          const openActions = mActions.filter(a => !a.done).length
          const init = initiatives.find(x => x.id === m.initiative_id)
          const proj = projects.find(x => x.id === m.project_id)
          return (
            <div key={m.id} onClick={() => { setSelected(m); setView('detail') }} style={{ padding:'12px 20px', cursor:'pointer', borderBottom: i<filtered.length-1?'1px solid var(--border)':'none', transition:'background 0.1s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{m.title}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:2, display:'flex', alignItems:'center', gap:8 }}>
                    <span>{m.date}{m.time?' · '+m.time:''}</span>
                    {m.hours>0 && <span>{m.hours}h</span>}
                    {init && <span style={{ color:'var(--text2)' }}>{init.name}{proj?' / '+proj.name:''}</span>}
                    {m.attendees?.length>0 && <span>{m.attendees.join(', ')}</span>}
                  </div>
                </div>
                <span className={`tag ${cls}`}>{label}</span>
                {openActions>0 && <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--amber)', background:'var(--amber-bg)', padding:'1px 6px', borderRadius:10 }}>{openActions} open</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
