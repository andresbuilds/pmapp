import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import TodayView from './views/TodayView'
import MeetingsView from './views/MeetingsView'
import DeliverablesView from './views/DeliverablesView'
import TasksView from './views/TasksView'
import PeopleView from './views/PeopleView'
import InitiativesView from './views/InitiativesView'
import WeeklyView from './views/WeeklyView'

const SESSION_KEY = 'pm_auth'

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY)==='1')
  const [view, setView] = useState('today')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ meetings:[], deliverables:[], actionItems:[], people:[], dailyNote:null, initiatives:[], projects:[] })

  useEffect(() => { if (authed) load() }, [authed])

  async function load() {
    setLoading(true)
    const today = new Date().toISOString().slice(0,10)
    const [meetings, deliverables, actionItems, people, dailyNotes, initiatives, projects] = await Promise.all([
      supabase.from('meetings').select('*').order('date', { ascending:false }),
      supabase.from('deliverables').select('*').order('created_at', { ascending:false }),
      supabase.from('action_items').select('*').order('created_at', { ascending:false }),
      supabase.from('people').select('*').order('name'),
      supabase.from('daily_notes').select('*').eq('date', today).limit(1),
      supabase.from('initiatives').select('*').order('name'),
      supabase.from('projects').select('*').order('name'),
    ])
    setData({
      meetings: meetings.data||[],
      deliverables: deliverables.data||[],
      actionItems: actionItems.data||[],
      people: people.data||[],
      dailyNote: dailyNotes.data?.[0]||null,
      initiatives: initiatives.data||[],
      projects: projects.data||[],
    })
    setLoading(false)
  }

  function handleLogin() { sessionStorage.setItem(SESSION_KEY,'1'); setAuthed(true) }

  if (!authed) return <Login onLogin={handleLogin} />

  const openDelCount = data.deliverables.filter(d=>d.status!=='done').length
  const openTaskCount = data.actionItems.filter(a=>!a.done && a.owner?.toLowerCase().includes('andres')).length
  const commonProps = { ...data, onRefresh: load }

  return (
    <>
      <Sidebar view={view} setView={setView} openDelCount={openDelCount} openTaskCount={openTaskCount} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {loading ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:13 }}>Loading…</div>
        ) : (
          <>
            {view==='today' && <TodayView {...commonProps} setView={setView} />}
            {view==='meetings' && <MeetingsView {...commonProps} />}
            {view==='deliverables' && <DeliverablesView {...commonProps} />}
            {view==='tasks' && <TasksView {...commonProps} />}
            {view==='people' && <PeopleView {...commonProps} />}
            {view==='initiatives' && <InitiativesView {...commonProps} />}
            {view==='weekly' && <WeeklyView {...commonProps} />}
          </>
        )}
      </div>
    </>
  )
}
