import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const EMPTY_INIT = { name: '', description: '', status: 'active' }
const EMPTY_PROJ = { name: '', description: '', initiative_id: '', status: 'active' }

export default function InitiativesView({ initiatives, projects, onRefresh }) {
  const [showInitForm, setShowInitForm] = useState(false)
  const [showProjForm, setShowProjForm] = useState(false)
  const [initForm, setInitForm] = useState(EMPTY_INIT)
  const [projForm, setProjForm] = useState(EMPTY_PROJ)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)

  async function saveInit() {
    setSaving(true)
    await supabase.from('initiatives').insert(initForm)
    setSaving(false); setShowInitForm(false); setInitForm(EMPTY_INIT); onRefresh()
  }

  async function saveProj() {
    setSaving(true)
    await supabase.from('projects').insert(projForm)
    setSaving(false); setShowProjForm(false); setProjForm(EMPTY_PROJ); onRefresh()
  }

  async function deleteInit(id) {
    await supabase.from('initiatives').delete().eq('id', id)
    setSelected(null); onRefresh()
  }

  async function deleteProj(id) {
    await supabase.from('projects').delete().eq('id', id)
    onRefresh()
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:20, fontWeight:500 }}>Initiatives & Projects</div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn" onClick={() => setShowProjForm(true)}>+ New project</button>
          <button className="btn btn-primary" onClick={() => setShowInitForm(true)}>+ New initiative</button>
        </div>
      </div>

      {initiatives.length === 0 && <div className="empty card">No initiatives yet — create one to start tracking capitalizable hours</div>}

      {initiatives.map(init => {
        const initProjects = projects.filter(p => p.initiative_id === init.id)
        return (
          <div key={init.id} className="card" style={{ padding:0, overflow:'hidden' }}>
            <div
              style={{ padding:'14px 20px', cursor:'pointer', background: selected===init.id ? 'var(--accent-bg)' : 'transparent', display:'flex', alignItems:'center', gap:12 }}
              onClick={() => setSelected(selected===init.id ? null : init.id)}
            >
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:500, color:'var(--text)' }}>{init.name}</div>
                {init.description && <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{init.description}</div>}
              </div>
              <span className={`status-badge s-${init.status==='active'?'in-progress':init.status==='complete'?'done':'review'}`}>
                {init.status}
              </span>
              <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)' }}>{initProjects.length} projects</span>
            </div>

            {selected === init.id && (
              <div style={{ borderTop:'1px solid var(--border)', padding:'14px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Projects</div>
                  <button className="btn btn-sm" onClick={() => { setProjForm({...EMPTY_PROJ, initiative_id: init.id}); setShowProjForm(true) }}>+ Add project</button>
                </div>
                {initProjects.length === 0 && <div style={{ fontSize:13, color:'var(--text3)', padding:'8px 0' }}>No projects yet</div>}
                {initProjects.map(p => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'var(--text)' }}>{p.name}</div>
                      {p.description && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{p.description}</div>}
                    </div>
                    <span className={`status-badge s-${p.status==='active'?'in-progress':p.status==='complete'?'done':'review'}`}>{p.status}</span>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteProj(p.id)}>×</button>
                  </div>
                ))}
                <button className="btn btn-sm btn-danger" style={{ marginTop:12 }} onClick={() => deleteInit(init.id)}>Delete initiative</button>
              </div>
            )}
          </div>
        )
      })}

      {/* Initiatives without projects */}
      {projects.filter(p => !p.initiative_id).length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">Unassigned projects</div></div>
          {projects.filter(p => !p.initiative_id).map(p => (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:'var(--text)' }}>{p.name}</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => deleteProj(p.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Initiative modal */}
      {showInitForm && (
        <div className="modal-overlay" onClick={() => setShowInitForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New initiative</div>
              <button className="close-btn" onClick={() => setShowInitForm(false)}>×</button>
            </div>
            <div className="form-row"><label>Name *</label><input type="text" placeholder="e.g. Talent Gateway" value={initForm.name} onChange={e => setInitForm({...initForm, name:e.target.value})} /></div>
            <div className="form-row"><label>Description</label><input type="text" placeholder="What is this initiative?" value={initForm.description} onChange={e => setInitForm({...initForm, description:e.target.value})} /></div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
              <button className="btn" onClick={() => setShowInitForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveInit} disabled={saving||!initForm.name}>{saving?'Saving…':'Save initiative'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Project modal */}
      {showProjForm && (
        <div className="modal-overlay" onClick={() => setShowProjForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New project</div>
              <button className="close-btn" onClick={() => setShowProjForm(false)}>×</button>
            </div>
            <div className="form-row"><label>Name *</label><input type="text" placeholder="e.g. LinkedIn RSC+ Phase 2" value={projForm.name} onChange={e => setProjForm({...projForm, name:e.target.value})} /></div>
            <div className="form-row"><label>Description</label><input type="text" value={projForm.description} onChange={e => setProjForm({...projForm, description:e.target.value})} /></div>
            <div className="form-row">
              <label>Initiative</label>
              <select value={projForm.initiative_id} onChange={e => setProjForm({...projForm, initiative_id:e.target.value})}>
                <option value="">None</option>
                {initiatives.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
              <button className="btn" onClick={() => setShowProjForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProj} disabled={saving||!projForm.name}>{saving?'Saving…':'Save project'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
