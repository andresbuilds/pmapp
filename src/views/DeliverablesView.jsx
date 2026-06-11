import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function fmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
}

const EMPTY_FORM = { title: '', due: '', priority: 'med', deliver_to: '', people_involved: '', notes: '' }
const EMPTY_AI = [{ owner: '', text: '' }]
const STATUSES = ['in-progress', 'review', 'done']
const STATUS_LABELS = { 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' }
const STATUS_CLS = { 'in-progress': 's-in-progress', 'review': 's-review', 'done': 's-done' }

export default function DeliverablesView({ deliverables, actionItems, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [ais, setAis] = useState(EMPTY_AI)
  const [saving, setSaving] = useState(false)

  const todayStr = fmtDate(new Date())

  async function save() {
    setSaving(true)
    const people = form.people_involved ? form.people_involved.split(',').map(s => s.trim()).filter(Boolean) : []
    const { data: del, error } = await supabase.from('deliverables').insert({
      title: form.title, due: form.due||null, priority: form.priority,
      deliver_to: form.deliver_to, people_involved: people, notes: form.notes, status: 'in-progress'
    }).select().single()
    if (!error && del) {
      const validAis = ais.filter(a => a.text.trim())
      if (validAis.length > 0) {
        await supabase.from('action_items').insert(validAis.map(a => ({ text: a.text, owner: a.owner, deliverable_id: del.id })))
      }
    }
    setSaving(false)
    setShowForm(false)
    setForm(EMPTY_FORM)
    setAis(EMPTY_AI)
    onRefresh()
  }

  async function updateStatus(id, status) {
    await supabase.from('deliverables').update({ status }).eq('id', id)
    if (selected?.id === id) setSelected({ ...selected, status })
    onRefresh()
  }

  async function deleteDeliverable(id) {
    await supabase.from('deliverables').delete().eq('id', id)
    setSelected(null)
    onRefresh()
  }

  async function toggleAction(id, done) {
    await supabase.from('action_items').update({ done: !done }).eq('id', id)
    onRefresh()
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 500 }}>Deliverables</div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setSelected(null) }}>+ New deliverable</button>
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, alignItems: 'start' }}>
        {STATUSES.map(status => {
          const items = deliverables.filter(d => d.status === status)
          return (
            <div key={status}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className={`status-badge ${STATUS_CLS[status]}`}>{STATUS_LABELS[status]}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{items.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.length === 0 && (
                  <div style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius)', padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Empty</div>
                )}
                {items.map(d => {
                  const isOverdue = d.due && d.due < todayStr && status !== 'done'
                  const dActions = actionItems.filter(a => a.deliverable_id === d.id)
                  const openActions = dActions.filter(a => !a.done).length
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelected(selected?.id === d.id ? null : d)}
                      className="card"
                      style={{ cursor: 'pointer', padding: '12px 14px', border: selected?.id === d.id ? '1px solid var(--accent)' : '1px solid var(--border)' }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{d.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className={`priority p-${d.priority||'med'}`}>{d.priority||'med'}</span>
                        {d.due && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>{isOverdue ? '⚠ ' : ''}{d.due}</span>}
                        {openActions > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber)' }}>{openActions} tasks</span>}
                      </div>
                      {d.deliver_to && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>→ {d.deliver_to}</div>}

                      {/* Expanded detail */}
                      {selected?.id === d.id && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                          {d.people_involved?.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>PEOPLE</div>
                              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{d.people_involved.join(', ')}</div>
                            </div>
                          )}
                          {d.notes && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>NOTES</div>
                              <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>{d.notes}</div>
                            </div>
                          )}
                          {dActions.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>TASKS</div>
                              {dActions.map(a => (
                                <div key={a.id} className="action-item-row">
                                  <div className={`checkbox ${a.done ? 'checked' : ''}`} onClick={() => toggleAction(a.id, a.done)} />
                                  <span style={{ flex: 1, fontSize: 12, color: 'var(--text)', textDecoration: a.done ? 'line-through' : 'none', opacity: a.done ? 0.5 : 1 }}>{a.text}</span>
                                  {a.owner && <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--surface2)', padding: '1px 6px', borderRadius: 10 }}>{a.owner}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Move status */}
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                            {STATUSES.filter(s => s !== status).map(s => (
                              <button key={s} className="btn btn-sm" onClick={() => updateStatus(d.id, s)}>Move to {STATUS_LABELS[s]}</button>
                            ))}
                          </div>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteDeliverable(d.id)}>Delete</button>
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

      {/* New deliverable modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New deliverable</div>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="form-row">
              <label>Title *</label>
              <input type="text" placeholder="What needs to get done?" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="form-grid form-row">
              <div>
                <label>Due date</label>
                <input type="date" value={form.due} onChange={e => setForm({...form, due: e.target.value})} />
              </div>
              <div>
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  <option value="high">High</option>
                  <option value="med">Med</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <label>Deliver to</label>
              <input type="text" placeholder="Who receives this?" value={form.deliver_to} onChange={e => setForm({...form, deliver_to: e.target.value})} />
            </div>
            <div className="form-row">
              <label>People involved (comma separated)</label>
              <input type="text" placeholder="Tyler, Arushi, Chris" value={form.people_involved} onChange={e => setForm({...form, people_involved: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Notes</label>
              <textarea placeholder="Context, requirements…" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="form-row">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ margin: 0 }}>Tasks</label>
                <button className="btn btn-sm" onClick={() => setAis([...ais, { owner: '', text: '' }])}>+ Add</button>
              </div>
              {ais.map((ai, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input type="text" placeholder="Owner" value={ai.owner} onChange={e => { const n=[...ais]; n[i]={...n[i],owner:e.target.value}; setAis(n) }} style={{ width: 130, flexShrink: 0 }} />
                  <input type="text" placeholder="Task…" value={ai.text} onChange={e => { const n=[...ais]; n[i]={...n[i],text:e.target.value}; setAis(n) }} />
                  {ais.length > 1 && <button className="btn btn-sm" onClick={() => setAis(ais.filter((_,j) => j !== i))}>×</button>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.title}>{saving ? 'Saving…' : 'Save deliverable'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
