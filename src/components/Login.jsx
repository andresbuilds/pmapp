import React, { useState } from 'react'

const PASSWORD = 'pmandres2026'

export default function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  function attempt() {
    if (pw === PASSWORD) { onLogin(); }
    else { setErr(true); setPw('') }
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 340, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: 32 }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>PM Dashboard</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>Enter your password to continue</div>
        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(false) }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            autoFocus
            style={{ borderColor: err ? 'var(--red)' : undefined }}
          />
          {err && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>Incorrect password</div>}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: '8px', marginTop: 4 }} onClick={attempt}>
          Sign in →
        </button>
      </div>
    </div>
  )
}
