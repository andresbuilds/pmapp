import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import TodayView from './views/TodayView'
import MeetingsView from './views/MeetingsView'
import DeliverablesView from './views/DeliverablesView'
import PeopleView from './views/PeopleView'
import WeeklyView from './views/WeeklyView'

const SESSION_KEY = 'pm_auth'

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [view, setView] = useState('today')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ meetings: [], deliverables: [], actionItems: [], people: [], dailyNote: null })

  useEffect(() => { if (authed) load() }, [authed])

  async function load() {
    setLoading(true)
    const today = new Date()
    const todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0')

    const [meetings, deliverables, actionItems, people, dailyNotes] = await Promise.all([
      supabase.from('meetings').select('*').order('date', { ascending: false }),
      supabase.from('deliverables').select('*').order('created_at', { ascending: false }),
      supabase.from('action_items').select('*').order('created_at', { ascending: false }),
      supabase.from('people').select('*').order('name'),
      supabase.from('daily_notes').select('*').eq('date', todayStr).limit(1),
    ])

    setData({
      meetings: meetings.data || [],
      deliverables: deliverables.data || [],
      actionItems: actionItems.data || [],
      people: people.data || [],
      dailyNote: dailyNotes.data?.[0] || null,
    })
    setLoading(false)
  }

  function handleLogin() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setAuthed(true)
  }

  if (!authed) return <Login onLogin={handleLogin} />

  const openDelCount = data.deliverables.filter(d => d.status !== 'done').length

  return (
    <>
      <Sidebar view={view} setView={setView} openDelCount={openDelCount} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>
            Loading…
          </div>
        ) : (
          <>
            {view === 'today' && <TodayView {...data} onRefresh={load} setView={setView} />}
            {view === 'meetings' && <MeetingsView meetings={data.meetings} actionItems={data.actionItems} onRefresh={load} />}
            {view === 'deliverables' && <DeliverablesView deliverables={data.deliverables} actionItems={data.actionItems} onRefresh={load} />}
            {view === 'people' && <PeopleView people={data.people} meetings={data.meetings} onRefresh={load} />}
            {view === 'weekly' && <WeeklyView meetings={data.meetings} deliverables={data.deliverables} actionItems={data.actionItems} />}
          </>
        )}
      </div>
    </>
  )
}
