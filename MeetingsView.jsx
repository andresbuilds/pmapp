import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const AVATAR_COLORS = [
  ['rgba(79,142,247,0.2)','#4F8EF7'],
  ['rgba(34,197,94,0.2)','#22C55E'],
  ['rgba(167,139,250,0.2)','#A78BFA'],
  ['rgba(245,158,11,0.2)','#F59E0B'],
  ['rgba(45,212,191,0.2)','#2DD4BF'],
]

function initials(name) {
  return (name||'').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()
}

const EMPTY_FORM = { name: '', role: '', company: '', team: '', notes: '' }

export default function PeopleView({ people, meetings, onRefresh }) {
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await supabase.from('people').insert(form)
    setSaving(false)
    setShowForm(false)
    setForm(EMPTY_FORM)
    onRefresh()
  }

  async function deletePerson(id) {
    await supabase.from('people').delete().eq('id', id)
    setSelected(null)
    onRefresh()
  }

  const personMeetings = selected
    ? meetings.filter(m => m.attendees?.some(a => a.toLowerCase().includes(selected.name.toLowerCase())))
        .sort((a,b) => b.date.localeCompare(a.date))
    : []

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 500 }}>People</div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setSelected(null) }}>+ Add person</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '280px 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, alignItems: 'start' }}>
        {/* Person cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {people.length === 0 && !selected && <div className="empty" style={{ gridColumn: '1/-1' }}>No people yet — add your collaborators</div>}
          {people.map((p, i) => {
            const [bg, fg] = AVATAR_COLORS[i % AVATAR_COLORS.length]
            return (
              <div
                key={p.id}
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
                className="card"
                style={{ cursor: 'pointer', padding: '12px 14px', border: selected?.id === p.id ? '1px solid var(--accent)' : '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                  {initials(p.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[p.role, p.company].filter(Boolean).join(' · ') || 'No role set'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Person detail */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)' }}>{selected.name}</div>
                  {selected.role && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{selected.role}</div>}
                  {(selected.company || selected.team) && (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {[selected.company, selected.team].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => deletePerson(selected.id)}>Remove</button>
              </div>
              {selected.notes && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>NOTES</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>{selected.notes}</div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Meeting history ({personMeetings.length})</div>
              </div>
              {personMeetings.length === 0 ? (
                <div className="empty" style={{ padding: '16px 0' }}>No meetings logged with {selected.name}</div>
              ) : personMeetings.map(m => (
                <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                    {m.date}{m.time ? ' · ' + m.time : ''}
                  </div>
                  {m.decisions && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, fontStyle: 'italic' }}>{m.decisions.slice(0, 100)}{m.decisions.length > 100 ? '…' : ''}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add person modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add person</div>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="form-row">
              <label>Name *</label>
              <input type="text" placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-grid form-row">
              <div>
                <label>Role</label>
                <input type="text" placeholder="e.g. Engineering Lead" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
              </div>
              <div>
                <label>Company</label>
                <input type="text" placeholder="e.g. iCIMS" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <label>Team</label>
              <input type="text" placeholder="e.g. Platform Services" value={form.team} onChange={e => setForm({...form, team: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Notes</label>
              <textarea placeholder="Working style, context, things to remember…" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.name}>{saving ? 'Saving…' : 'Save person'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
