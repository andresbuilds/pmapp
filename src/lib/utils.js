export function fmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
}

export function getMeetingTag(type) {
  const t = (type||'').toLowerCase()
  if (t === '1-on-1') return ['1:1', 'tag-oneone']
  if (t === 'standup') return ['Standup', 'tag-standup']
  if (t === 'stakeholder') return ['Stakeholder', 'tag-stakeholder']
  if (t === 'external') return ['External', 'tag-external']
  return ['Ad hoc', 'tag-adhoc']
}

export function getWeekBounds(offset = 0) {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - day + (offset * 7))
  start.setHours(0,0,0,0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: fmtDate(start), end: fmtDate(end), startDate: start, endDate: end }
}

export const TASK_STATUSES = ['todo', 'in-progress', 'done']
export const TASK_STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' }
export const TASK_STATUS_CLS = { 'todo': 'tag-adhoc', 'in-progress': 'tag-oneone', 'done': 'tag-stakeholder' }

export const DEL_STATUSES = ['in-progress', 'review', 'done']
export const DEL_STATUS_LABELS = { 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' }
export const DEL_STATUS_CLS = { 'in-progress': 's-in-progress', 'review': 's-review', 'done': 's-done' }
