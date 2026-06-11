import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

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

export default function TodayView({ meetings, deliverables, actionItems, dailyNote, onRefresh, setView }) {
  const d = new Date()
  const todayStr = fmtDate(d)
  const todayMeetings = meetings.filter(m => m.date === todayStr).sort((a,b) => (a.time||'').localeCompare(b.time||''))
  const openDels = deliverables.filter(d => d.status !== 'done')
  const overdue = deliverables.filter(d => d.due && d.due < todayStr && d.status !== 'done')
  const myActions = actionItems.filter(a => !a.done && a.owner && a.owner.toLowerCase().includes('andres'))

  const [top3, setTop3] = useState(dailyNote?.top3 || ['','',''])
  const [saving, setSaving] = useState(false)

  async function saveTop3() {
    setSaving(true)
    const filled = top3.filter(t => t.trim())
    if (dailyNote) {
      await supabase.from('daily_notes').update({ top3: filled }).eq('id', dailyNote.id)
    } else {
      await supabase.from('daily_notes').insert({ date: todayStr, top3: filled })
    }
    setSaving(false)
    onRefresh()
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>
          {MONTHS[d.getMonth()]} {d.getDate()}, {d.getFullYear()}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginTop: 3, letterSpacing: '0.08em' }}>
          {DAYS[d.getDay()].toUpperCase()}
        </div>
      </div>

      {/* Top 3 */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🎯 Top 3 for today</div>
          <button className="btn btn-sm" onClick={saveTop3} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
        {[0,1,2].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', width: 16 }}>{i+1}</span>
            <input
              type="text"
              placeholder={`Priority ${i+1}…`}
              value={top3[i]||''}
              onChange={e => { const n=[...top3]; n[i]=e.target.value; setTop3(n) }}
              style={{ flex: 1 }}
            />
          </div>
        ))}
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--red)', fontSize: 13, fontWeight: 500 }}>⚠ {overdue.length} overdue deliverable{overdue.length > 1 ? 's' : ''}</span>
          <button className="btn btn-sm" onClick={() => setView('deliverables')} style={{ marginLeft: 'auto' }}>View →</button>
        </div>
      )}

      {/* Today's meetings */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📅 Today's meetings</div>
          <button className="btn btn-sm btn-primary" onClick={() => setView('meetings')}>+ Log meeting</button>
        </div>
        {todayMeetings.length === 0 ? (
          <div className="empty">No meetings logged for today</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todayMeetings.map(m => {
              const [label, cls] = getMeetingTag(m.type)
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', width: 38, flexShrink: 0 }}>{m.time||'—'}</span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{m.title}</span>
                  <span className={`tag ${cls}`}>{label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stats + previews */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Open deliverables', val: openDels.length, color: 'var(--accent)' },
          { label: 'My open actions', val: myActions.length, color: 'var(--amber)' },
          { label: 'Meetings today', val: todayMeetings.length, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Open action items assigned to me */}
      {myActions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚡ My open action items</div>
          </div>
          {myActions.slice(0,6).map(a => (
            <div key={a.id} className="action-item-row">
              <div className="checkbox" onClick={async () => { await supabase.from('action_items').update({ done: true }).eq('id', a.id); onRefresh() }} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{a.text}</span>
              {a.due && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{a.due}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Recent deliverables */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📦 Open deliverables</div>
          <button className="btn btn-sm" onClick={() => setView('deliverables')}>See all →</button>
        </div>
        {openDels.length === 0 ? (
          <div className="empty">All clear 🎉</div>
        ) : openDels.slice(0,4).map(d => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{d.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                {d.due ? `due ${d.due}` : 'no due date'}{d.deliver_to ? ` · ${d.deliver_to}` : ''}
              </div>
            </div>
            <span className={`priority p-${d.priority||'med'}`}>{d.priority||'med'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
