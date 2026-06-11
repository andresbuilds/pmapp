import React from 'react'

function fmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
}

function getMeetingTag(type) {
  const t = (type||'').toLowerCase()
  if (t === '1-on-1') return ['1:1', 'tag-oneone']
  if (t === 'standup') return ['Standup', 'tag-standup']
  if (t === 'stakeholder') return ['Stakeholder', 'tag-stakeholder']
  if (t === 'external') return ['External', 'tag-external']
  return ['Ad hoc', 'tag-adhoc']
}

export default function WeeklyView({ meetings, deliverables, actionItems }) {
  const now = new Date()
  const day = now.getDay()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - day)
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + (6 - day))
  const nextWeekStart = new Date(weekEnd); nextWeekStart.setDate(weekEnd.getDate() + 1)
  const nextWeekEnd = new Date(nextWeekStart); nextWeekEnd.setDate(nextWeekStart.getDate() + 6)

  const wsStr = fmtDate(weekStart), weStr = fmtDate(weekEnd)
  const nwsStr = fmtDate(nextWeekStart), nweStr = fmtDate(nextWeekEnd)
  const todayStr = fmtDate(now)

  const thisWeekMeetings = meetings.filter(m => m.date >= wsStr && m.date <= weStr)
  const completedThis = deliverables.filter(d => d.status === 'done')
  const nextWeekDue = deliverables.filter(d => d.due && d.due >= nwsStr && d.due <= nweStr && d.status !== 'done')
  const overdue = deliverables.filter(d => d.due && d.due < todayStr && d.status !== 'done')
  const myDoneActions = actionItems.filter(a => a.done && a.owner?.toLowerCase().includes('andres'))

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontSize: 20, fontWeight: 500 }}>Weekly recap</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: -10 }}>
        {wsStr} → {weStr}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Meetings this week', val: thisWeekMeetings.length, color: 'var(--accent)' },
          { label: 'Deliverables done', val: completedThis.length, color: 'var(--green)' },
          { label: 'Actions completed', val: myDoneActions.length, color: 'var(--teal)' },
          { label: 'Overdue', val: overdue.length, color: overdue.length > 0 ? 'var(--red)' : 'var(--text3)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* This week's meetings */}
        <div className="card">
          <div className="card-header"><div className="card-title">This week's meetings</div></div>
          {thisWeekMeetings.length === 0 ? (
            <div className="empty">No meetings this week</div>
          ) : thisWeekMeetings.sort((a,b) => a.date.localeCompare(b.date)).map(m => {
            const [label, cls] = getMeetingTag(m.type)
            return (
              <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>{m.date}</div>
                </div>
                <span className={`tag ${cls}`}>{label}</span>
              </div>
            )
          })}
        </div>

        {/* Coming up next week */}
        <div className="card">
          <div className="card-header"><div className="card-title">Due next week</div></div>
          {nextWeekDue.length === 0 ? (
            <div className="empty">Nothing due next week</div>
          ) : nextWeekDue.map(d => (
            <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{d.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>{d.due}{d.deliver_to ? ' · ' + d.deliver_to : ''}</div>
              </div>
              <span className={`priority p-${d.priority||'med'}`}>{d.priority||'med'}</span>
            </div>
          ))}
        </div>

        {/* Overdue */}
        {overdue.length > 0 && (
          <div className="card" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
            <div className="card-header"><div className="card-title" style={{ color: 'var(--red)' }}>⚠ Overdue</div></div>
            {overdue.map(d => (
              <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)', marginTop: 2 }}>was due {d.due}</div>
                </div>
                <span className={`priority p-${d.priority||'med'}`}>{d.priority||'med'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Completed deliverables */}
        <div className="card">
          <div className="card-header"><div className="card-title">✅ Completed deliverables</div></div>
          {completedThis.length === 0 ? (
            <div className="empty">Nothing marked done yet</div>
          ) : completedThis.map(d => (
            <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'line-through' }}>{d.title}</div>
              {d.deliver_to && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>→ {d.deliver_to}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
