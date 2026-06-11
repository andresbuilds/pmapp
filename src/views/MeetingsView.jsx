import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function getMeetingTag(type) {
  const t = (type||'').toLowerCase()
  if (t === '1-on-1') return ['1:1', 'tag-oneone']
  if (t === 'standup') return ['Standup', 'tag-standup']
  if (t === 'stakeholder') return ['Stakeholder', 'tag-stakeholder']
  if (t === 'external') return ['External', 'tag-external']
  return ['Ad hoc', 'tag-adhoc']
}

function fmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
}

const EMPTY_FORM = { title: '', date: fmtDate(new Date()), time: '', type: 'adhoc', attendees: '', goal: '', notes: '', decisions: '' }
const EMPTY_AI = [{ owner: '', text: '' }]

export default function MeetingsView({ meetings, actionItems, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [ais, setAis] = useState(EMPTY_AI)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')
  const [deleting, setDeleting] = useState(false)

  const filtered = meetings.filter(m => filter === 'all' || m.type === filter)
    .sort((a,b) => b.date.localeCompare(a.date) || (b.time||'').localeCompare(a.time||''))

  async function save() {
    setSaving(true)
    const attendees = form.attendees ? form.attendees.split(',').map(s => s.trim()).filter(Boolean) : []
    const { data: meet, error } = await supabase.from('meetings').insert({
      title: form.title, date: form.date, time: form.time||null,
      type: form.type, attendees, goal: form.goal, notes: form.notes, decisions: form.decisions
    }).select().single()
    if (!error && meet) {
      const validAis = ais.filter(a => a.text.trim())
      if (validAis.length > 0) {
        await supabase.from('action_items').insert(validAis.map(a => ({ text: a.text, owner: a.owner, meeting_id: meet.id })))
      }
    }
    setSaving(false)
    setShowForm(false)
    setForm(EMPTY_FORM)
    setAis(EMPTY_AI)
    onRefresh()
  }

  async function deleteMeeting(id) {
    setDeleting(true)
    await supabase.from('meetings').delete().eq('id', id)
    setSelected(null)
    setDeleting(false)
    onRefresh()
  }

  async function toggleAction(id, done) {
    await supabase.from('action_items').update({ done: !done }).eq('id', id)
    onRefresh()
  }

  const selectedActions = selected ? actionItems.filter(a => a.meeting_id === selected.id) : []

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 500 }}>Meetings</div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setSelected(null) }}>+ Log meeting</button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['all','1-on-1','standup','stakeholder','external','adhoc'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === '1-on-1' ? '1:1s' : f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty" style={{ padding: 32 }}>No meetings yet — log your first one</div>
        ) : filtered.map((m, i) => {
          const [label, cls] = getMeetingTag(m.type)
          const mActions = actionItems.filter(a => a.meeting_id === m.id)
          const openActions = mActions.filter(a => !a.done).length
          return (
            <div
              key={m.id}
              onClick={() => setSelected(selected?.id === m.id ? null : m)}
              style={{
                padding: '12px 20px', cursor: 'pointer',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                background: selected?.id === m.id ? 'var(--accent-bg)' : 'transparent',
                transition: 'background 0.1s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                    {m.date}{m.time ? ' · ' + m.time : ''}{m.attendees?.length ? ' · ' + m.attendees.join(', ') : ''}
                  </div>
                </div>
                <span className={`tag ${cls}`}>{label}</span>
                {openActions > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber)', background: 'var(--amber-bg)', padding: '1px 6px', borderRadius: 10 }}>{openActions} actions</span>}
              </div>

              {selected?.id === m.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                  {m.goal && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>GOAL</div><div style={{ fontSize: 13, color: 'var(--text2)' }}>{m.goal}</div></div>}
                  {m.notes && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>NOTES</div><div style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>{m.notes}</div></div>}
                  {m.decisions && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>DECISIONS</div><div style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>{m.decisions}</div></div>}
                  {selectedActions.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>ACTION ITEMS</div>
                      {selectedActions.map(a => (
                        <div key={a.id} className="action-item-row">
                          <div className={`checkbox ${a.done ? 'checked' : ''}`} onClick={() => toggleAction(a.id, a.done)} />
                          <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', textDecoration: a.done ? 'line-through' : 'none', opacity: a.done ? 0.5 : 1 }}>{a.text}</span>
                          {a.owner && <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface2)', padding: '1px 8px', borderRadius: 10 }}>{a.owner}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="btn btn-sm btn-danger" onClick={() => deleteMeeting(m.id)} disabled={deleting}>Delete meeting</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Log meeting modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Log a meeting</div>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>

            <div className="form-row">
              <label>Title *</label>
              <input type="text" placeholder="e.g. 1:1 Tyler Bisbee" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="form-grid form-row">
              <div>
                <label>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label>Time</label>
                <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
              </div>
            </div>
            <div className="form-grid form-row">
              <div>
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="adhoc">Ad hoc</option>
                  <option value="1-on-1">1:1</option>
                  <option value="standup">Standup</option>
                  <option value="stakeholder">Stakeholder</option>
                  <option value="external">External</option>
                </select>
              </div>
              <div>
                <label>Attendees (comma separated)</label>
                <input type="text" placeholder="Tyler, Arushi, Chris" value={form.attendees} onChange={e => setForm({...form, attendees: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <label>Goal / context</label>
              <input type="text" placeholder="What was this meeting about?" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Notes</label>
              <textarea placeholder="Key discussion points…" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Decisions made</label>
              <textarea placeholder="What was decided?" value={form.decisions} onChange={e => setForm({...form, decisions: e.target.value})} style={{ minHeight: 60 }} />
            </div>

            {/* Action items */}
            <div className="form-row">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ margin: 0 }}>Action items</label>
                <button className="btn btn-sm" onClick={() => setAis([...ais, { owner: '', text: '' }])}>+ Add</button>
              </div>
              {ais.map((ai, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input type="text" placeholder="Owner (e.g. Andres)" value={ai.owner} onChange={e => { const n=[...ais]; n[i]={...n[i],owner:e.target.value}; setAis(n) }} style={{ width: 130, flexShrink: 0 }} />
                  <input type="text" placeholder="Action item…" value={ai.text} onChange={e => { const n=[...ais]; n[i]={...n[i],text:e.target.value}; setAis(n) }} />
                  {ais.length > 1 && <button className="btn btn-sm" onClick={() => setAis(ais.filter((_,j) => j !== i))}>×</button>}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.title}>{saving ? 'Saving…' : 'Save meeting'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
