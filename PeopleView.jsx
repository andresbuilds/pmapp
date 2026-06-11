*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0F1623;
  --surface: #1A2333;
  --surface2: #212d40;
  --border: rgba(255,255,255,0.08);
  --border2: rgba(255,255,255,0.14);
  --text: #E2E8F0;
  --text2: #8899AA;
  --text3: #536070;
  --accent: #4F8EF7;
  --accent-bg: rgba(79,142,247,0.12);
  --green: #22C55E;
  --green-bg: rgba(34,197,94,0.12);
  --amber: #F59E0B;
  --amber-bg: rgba(245,158,11,0.12);
  --purple: #A78BFA;
  --purple-bg: rgba(167,139,250,0.12);
  --teal: #2DD4BF;
  --teal-bg: rgba(45,212,191,0.12);
  --red: #F87171;
  --red-bg: rgba(248,113,113,0.12);
  --radius: 10px;
  --radius-sm: 6px;
  --font: 'Inter', sans-serif;
  --mono: 'JetBrains Mono', monospace;
}

body { font-family: var(--font); background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.5; }

#root { display: flex; height: 100vh; overflow: hidden; }

button { font-family: var(--font); cursor: pointer; }
input, textarea, select { font-family: var(--font); }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

.btn {
  background: var(--surface2);
  border: 1px solid var(--border2);
  color: var(--text2);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.1s;
  white-space: nowrap;
}
.btn:hover { border-color: var(--accent); color: var(--accent); }
.btn-primary { background: var(--accent-bg); border-color: rgba(79,142,247,0.3); color: var(--accent); }
.btn-danger { background: var(--red-bg); border-color: rgba(248,113,113,0.3); color: var(--red); }
.btn-sm { font-size: 11px; padding: 4px 10px; }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.card-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tag {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}
.tag-oneone    { background: var(--accent-bg); color: var(--accent); }
.tag-standup   { background: var(--amber-bg); color: var(--amber); }
.tag-stakeholder { background: var(--green-bg); color: var(--green); }
.tag-external  { background: var(--purple-bg); color: var(--purple); }
.tag-adhoc     { background: var(--surface2); color: var(--text3); border: 1px solid var(--border); }

.priority { font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 10px; }
.p-high { background: var(--red-bg); color: var(--red); }
.p-med  { background: var(--amber-bg); color: var(--amber); }
.p-low  { background: var(--green-bg); color: var(--green); }

.status-badge { font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 10px; }
.s-in-progress { background: var(--accent-bg); color: var(--accent); }
.s-review { background: var(--amber-bg); color: var(--amber); }
.s-done { background: var(--green-bg); color: var(--green); }

.empty { text-align: center; padding: 32px 0; color: var(--text3); font-size: 13px; }

.divider { border: none; border-top: 1px solid var(--border); margin: 12px 0; }

input[type="text"], input[type="date"], input[type="time"], input[type="password"], textarea, select {
  background: var(--surface2);
  border: 1px solid var(--border2);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 7px 10px;
  font-size: 13px;
  width: 100%;
  outline: none;
  transition: border-color 0.1s;
}
input:focus, textarea:focus, select:focus { border-color: var(--accent); }
textarea { resize: vertical; min-height: 80px; }
select option { background: var(--surface2); }

label { font-size: 12px; color: var(--text2); display: block; margin-bottom: 4px; }

.form-row { margin-bottom: 12px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title { font-size: 16px; font-weight: 500; color: var(--text); }

.close-btn {
  background: none;
  border: none;
  color: var(--text3);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.close-btn:hover { color: var(--text); }

.action-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.action-item-row:last-child { border-bottom: none; }

.checkbox {
  width: 16px; height: 16px;
  border-radius: 4px;
  border: 1.5px solid var(--border2);
  flex-shrink: 0;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  background: transparent;
}
.checkbox:hover { border-color: var(--green); }
.checkbox.checked { background: var(--green); border-color: var(--green); }
.checkbox.checked::after {
  content: '';
  width: 8px; height: 5px;
  border-left: 1.5px solid #fff;
  border-bottom: 1.5px solid #fff;
  transform: rotate(-45deg) translateY(-1px);
  display: block;
}

.done-text { text-decoration: line-through; color: var(--text3); }
