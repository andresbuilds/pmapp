import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { fmtDate, DEL_STATUSES, DEL_STATUS_LABELS, DEL_STATUS_CLS, TASK_STATUSES, TASK_STATUS_LABELS } from '../lib/utils'

const EMPTY_FORM = { title:'', due:'', priority:'med', deliver_to:'', people_involved:'', notes:'', project_id:'', initiative_id:'' }
const EMPTY_AI = [{ owner:'', text:'', status:'todo' }]

export default function DeliverablesView({ deliverables, actionItems, people, initiatives, projects, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [ais, setAis] = useState(EMPTY_AI)
  const [saving, setSaving] = useState(false)
  const todayStr = fmtDate(new Date())
  const filtProjects = form.initiative_id ? projects.filter(p => p.initiative_id === form.initiative_id) : projects

  async function save() {
    setSaving(true)
    const inv = form.people_involved ? form.people_involved.split(',').map(s=>s.trim()).filter(Boolean) : []
    const { data: del } = await supabase.from('deliverables').insert({
      title:form.title, due:form.due||null, priority:form.priority, deliver_to:form.deliver_to,
      people_involved:inv, notes:form.notes, status:'in-progress',
      project_id:form.project_id||null, initiative_id:form.initiative_id||null
    }).select().single()
    if (del) {
      const valid = ais.filter(a=>a.text.trim())
      if (valid.length>0) await supabase.from('action_items').insert(valid.map(a=>({ text:a.text, owner:a.owner, deliverable_id:del.id, status:a.status||'todo' })))
    }
    setSaving(false); setShowForm(false); setForm(EMPTY_FORM); setAis(EMPTY_AI); onRefresh()
  }

  async function updateStatus(id, status) {
    await supabase.from('deliverables').update({ status }).eq('id', id)
    if (selected?.id===id) setSelected({...selected,status})
    onRefresh()
  }

  async function updateTaskStatus(id, status) {
    await supabase.from('action_items').update({ status, done: status==='done' }).eq('id', id)
    onRefresh()
  }

  async function deleteDeliverable(id) {
    await supabase.from('deliverables').delete().eq('id', id)
    setSelected(null); onRefresh()
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:20, fontWeight:500 }}>Deliverables</div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setSelected(null) }}>+ New deliverable</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, alignItems:'start' }}>
        {DEL_STATUSES.map(status => {
          const items = deliverables.filter(d=>d.status===status)
          return (
            <div key={status}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span className={`status-badge ${DEL_STATUS_CLS[status]}`}>{DEL_STATUS_LABELS[status]}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)' }}>{items.length}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {items.length===0 && <div style={{ border:'1px dashed var(--border)', borderRadius:'var(--radius)', padding:20, textAlign:'center', color:'var(--text3)', fontSize:12 }}>Empty</div>}
                {items.map(d => {
                  const isOverdue = d.due && d.due < todayStr && status!=='done'
                  const dActions = actionItems.filter(a=>a.deliverable_id===d.id)
                  const openTasks = dActions.filter(a=>a.status!=='done').length
                  const init = initiatives.find(i=>i.id===d.initiative_id)
                  const proj = projects.find(p=>p.id===d.project_id)
                  return (
                    <div key={d.id} onClick={() => setSelected(selected?.id===d.id?null:d)} className="card"
                      style={{ cursor:'pointer', padding:'12px 14px', border:selected?.id===d.id?'1px solid var(--accent)':'1px solid var(--border)' }}>
                      <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:6 }}>{d.title}</div>
                      {(init||proj) && <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>{init?.name}{proj?' / '+proj.name:''}</div>}
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        <span className={`priority p-${d.priority||'med'}`}>{d.priority||'med'}</span>
                        {d.due && <span style={{ fontFamily:'var(--mono)', fontSize:10, color:isOverdue?'var(--red)':'var(--text3)' }}>{isOverdue?'⚠ ':''}{d.due}</span>}
                        {openTasks>0 && <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--amber)' }}>{openTasks} open</span>}
                      </div>
                      {d.deliver_to && <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>→ {d.deliver_to}</div>}

                      {selected?.id===d.id && (
                        <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }} onClick={e=>e.stopPropagation()}>
                          {d.notes && <div style={{ marginBottom:10 }}><div style={{ fontSize:10, color:'var(--text3)', marginBottom:3 }}>NOTES</div><div style={{ fontSize:12, color:'var(--text2)', whiteSpace:'pre-wrap' }}>{d.notes}</div></div>}
                          {dActions.length>0 && (
                            <div style={{ marginBottom:10 }}>
                              <div style={{ fontSize:10, color:'var(--text3)', marginBottom:6 }}>TASKS</div>
                              {dActions.map(a => (
                                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:'1px solid var(--border)' }}>
                                  <span style={{ flex:1, fontSize:12, color:'var(--text)', textDecoration:a.status==='done'?'line-through':'none', opacity:a.status==='done'?0.5:1 }}>{a.text}</span>
                                  {a.owner && <span style={{ fontSize:10, color:'var(--text3)', background:'var(--surface2)', padding:'1px 6px', borderRadius:10 }}>{a.owner}</span>}
                                  <select value={a.status||'todo'} onChange={e=>updateTaskStatus(a.id,e.target.value)} onClick={e=>e.stopPropagation()} style={{ fontSize:10, padding:'2px 6px', width:'auto' }}>
                                    {TASK_STATUSES.map(s=><option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                            {DEL_STATUSES.filter(s=>s!==status).map(s=>(
                              <button key={s} className="btn btn-sm" onClick={()=>updateStatus(d.id,s)}>→ {DEL_STATUS_LABELS[s]}</button>
                            ))}
                          </div>
                          <button className="btn btn-sm btn-danger" onClick={()=>deleteDeliverable(d.id)}>Delete</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="modal" style={{ maxWidth:640 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">New deliverable</div><button className="close-btn" onClick={()=>setShowForm(false)}>×</button></div>
            <div className="form-row"><label>Title *</label><input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
            <div className="form-grid form-row">
              <div><label>Due date</label><input type="date" value={form.due} onChange={e=>setForm({...form,due:e.target.value})} /></div>
              <div><label>Priority</label><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="high">High</option><option value="med">Med</option><option value="low">Low</option></select></div>
            </div>
            <div className="form-grid form-row">
              <div><label>Initiative</label><select value={form.initiative_id} onChange={e=>setForm({...form,initiative_id:e.target.value,project_id:''})}><option value="">None</option>{initiatives.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
              <div><label>Project</label><select value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})}><option value="">None</option>{filtProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            </div>
            <div className="form-row"><label>Deliver to</label><input type="text" value={form.deliver_to} onChange={e=>setForm({...form,deliver_to:e.target.value})} /></div>
            <div className="form-row"><label>People involved</label><input type="text" placeholder="Tyler, Arushi, Chris" value={form.people_involved} onChange={e=>setForm({...form,people_involved:e.target.value})} /></div>
            <div className="form-row"><label>Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
            <div className="form-row">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}><label style={{ margin:0 }}>Tasks</label><button className="btn btn-sm" onClick={()=>setAis([...ais,{owner:'',text:'',status:'todo'}])}>+ Add</button></div>
              {ais.map((ai,i)=>(
                <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
                  <select value={ai.owner} onChange={e=>{const n=[...ais];n[i]={...n[i],owner:e.target.value};setAis(n)}} style={{ width:130, flexShrink:0 }}><option value="">Owner</option>{people.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}</select>
                  <input type="text" placeholder="Task…" value={ai.text} onChange={e=>{const n=[...ais];n[i]={...n[i],text:e.target.value};setAis(n)}} />
                  {ais.length>1 && <button className="btn btn-sm" onClick={()=>setAis(ais.filter((_,j)=>j!==i))}>×</button>}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
              <button className="btn" onClick={()=>setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.title}>{saving?'Saving…':'Save deliverable'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
