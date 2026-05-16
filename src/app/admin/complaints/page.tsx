'use client'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle, CheckCircle, Clock, Flame, Search, Paperclip, Send,
  Lock, History, Building2, User as UserIcon, Plus, Edit2, X,
} from 'lucide-react'
import {
  getComplaints, getComplaintStats, getComplaintDetail, updateComplaint,
  addComplaintComment, getComplaintDepartments, getComplaintAssignees,
  createComplaintDepartment, updateComplaintDepartment, deleteComplaintDepartment,
} from '@/lib/api'

const STATUSES = ['open','in_progress','awaiting_customer','in_review','resolved','closed','reopened'] as const
type Status = typeof STATUSES[number]
const statusColors: Record<string,string> = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-blue-100 text-blue-700',
  awaiting_customer: 'bg-purple-100 text-purple-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-600',
  reopened: 'bg-orange-100 text-orange-700',
}
const priorityColors: Record<string,string> = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-yellow-50 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}
const typeLabels: Record<string,string> = {
  service_quality:'Service Quality', late_arrival:'Late Arrival', no_show:'No Show',
  rude_behavior:'Rude Behavior', billing:'Billing Issue', damage:'Property Damage', other:'Other',
}

const fmtDate = (d?: string) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [departments, setDepartments] = useState<any[]>([])
  const [assignees, setAssignees] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [showDeptModal, setShowDeptModal] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      getComplaints({
        status: statusFilter || undefined, priority: priorityFilter || undefined,
        department_id: deptFilter || undefined, search: search || undefined,
        page, limit: 20,
      }),
      getComplaintStats(),
    ]).then(([c, s]) => {
      setComplaints(c.data.data.complaints); setTotal(c.data.data.total); setStats(s.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => {
    getComplaintDepartments().then(r => setDepartments(r.data.data))
    getComplaintAssignees().then(r => setAssignees(r.data.data))
  }, [])
  useEffect(() => { load() }, [statusFilter, priorityFilter, deptFilter, page])

  const openDetail = async (id: number) => {
    try {
      const r = await getComplaintDetail(id)
      setSelected(r.data.data)
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to load') }
  }
  const reloadDetail = async () => { if (selected) { const r = await getComplaintDetail(selected.id); setSelected(r.data.data) } }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">{total} total tickets</p>
        </div>
        <button onClick={() => setShowDeptModal(true)} className="btn-outline flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Manage Departments
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Open', value: stats.open, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-600 bg-blue-50' },
            { label: 'Awaiting Customer', value: stats.awaitingCustomer, icon: UserIcon, color: 'text-purple-600 bg-purple-50' },
            { label: 'High Priority', value: stats.highPriority, icon: Flame, color: 'text-orange-600 bg-orange-50' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{s.value || 0}</p><p className="text-xs text-gray-400">{s.label}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search ticket # / subject / description..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setPage(1), load())} />
          </div>
          <button onClick={() => { setPage(1); load() }} className="btn-primary">Search</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['', ...STATUSES].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s ? s.replace(/_/g,' ') : 'All Status'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['','high','medium','low'].map(p => (
            <button key={p} onClick={() => { setPriorityFilter(p); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${priorityFilter === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p || 'All Priority'}
            </button>
          ))}
          <select className="input max-w-[200px] text-xs" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Tickets table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Ticket #</th>
                <th className="text-left px-4 py-3">Subject / Type</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">Assigned</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
              ) : complaints.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No tickets found</td></tr>
              ) : complaints.map(c => (
                <tr key={c.id} onClick={() => openDetail(c.id)} className="border-t border-gray-100 cursor-pointer hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-primary-600">{c.ticket_number || `#${c.id}`}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[260px]">{c.subject || typeLabels[c.type] || c.type}</p>
                    <p className="text-xs text-gray-400">{typeLabels[c.type] || c.type}</p>
                  </td>
                  <td className="px-4 py-3"><p className="text-sm">{c.customer?.name}</p><p className="text-xs text-gray-400">{c.customer?.phone}</p></td>
                  <td className="px-4 py-3 text-gray-700">{c.department?.name || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-700">{c.assignedTo?.name || <span className="text-gray-400">Unassigned</span>}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-md ${priorityColors[c.priority]}`}>{c.priority}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusColors[c.status]}`}>{c.status?.replace(/_/g,' ')}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{Math.min((page-1)*20+1,total)}–{Math.min(page*20,total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page*20>=total} onClick={() => setPage(p=>p+1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {selected && (
        <TicketDrawer
          ticket={selected}
          departments={departments}
          assignees={assignees}
          onClose={() => setSelected(null)}
          onReload={() => { reloadDetail(); load() }}
        />
      )}

      {showDeptModal && (
        <DepartmentsModal
          departments={departments}
          onClose={() => setShowDeptModal(false)}
          onChanged={() => getComplaintDepartments().then(r => setDepartments(r.data.data))}
        />
      )}
    </div>
  )
}

// ── Ticket Detail Drawer ─────────────────────────────────────────────────────
function TicketDrawer({ ticket, departments, assignees, onClose, onReload }: any) {
  const [comment, setComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [edit, setEdit] = useState({
    status: ticket.status, priority: ticket.priority, department_id: ticket.department_id || '',
    assigned_to: ticket.assigned_to || '', subject: ticket.subject || '', resolution_notes: ticket.resolution_notes || '',
  })
  const [savingMeta, setSavingMeta] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const send = async () => {
    if (!comment.trim() && files.length === 0) { toast.error('Add a comment or attachment'); return }
    setSending(true)
    try {
      const fd = new FormData()
      if (comment.trim()) fd.append('comment', comment.trim())
      fd.append('is_internal', String(isInternal))
      files.forEach(f => fd.append('attachments', f))
      await addComplaintComment(ticket.id, fd)
      setComment(''); setIsInternal(false); setFiles([])
      if (fileRef.current) fileRef.current.value = ''
      onReload()
      toast.success('Comment added')
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setSending(false) }
  }

  const saveMeta = async () => {
    setSavingMeta(true)
    try {
      await updateComplaint(ticket.id, edit)
      toast.success('Ticket updated')
      onReload()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setSavingMeta(false) }
  }

  // merge comments + status history for unified timeline
  const events = [
    ...(ticket.comments || []).map((c: any) => ({ kind: 'comment', at: c.created_at, data: c })),
    ...(ticket.history || []).map((h: any) => ({ kind: 'status', at: h.created_at, data: h })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-3xl h-full overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-xs text-primary-600">{ticket.ticket_number}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusColors[ticket.status]}`}>{ticket.status?.replace(/_/g,' ')}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{ticket.subject || typeLabels[ticket.type] || ticket.type}</h2>
            <p className="text-xs text-gray-500 mt-1">Filed by <strong>{ticket.customer?.name}</strong> ({ticket.customer?.phone}) · {fmtDate(ticket.created_at)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 p-5 bg-gray-50 border-b border-gray-100 text-sm">
          <div>
            <label className="block text-[11px] uppercase text-gray-400 mb-1">Department</label>
            <select className="input text-sm" value={edit.department_id || ''} onChange={e => setEdit({ ...edit, department_id: e.target.value })}>
              <option value="">— None —</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase text-gray-400 mb-1">Assigned To</label>
            <select className="input text-sm" value={edit.assigned_to || ''} onChange={e => setEdit({ ...edit, assigned_to: e.target.value })}>
              <option value="">Unassigned</option>
              {assignees.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase text-gray-400 mb-1">Status</label>
            <select className="input text-sm" value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value as Status })}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase text-gray-400 mb-1">Priority</label>
            <select className="input text-sm" value={edit.priority} onChange={e => setEdit({ ...edit, priority: e.target.value })}>
              {['low','medium','high'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase text-gray-400 mb-1">Subject</label>
            <input className="input text-sm" value={edit.subject} onChange={e => setEdit({ ...edit, subject: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[11px] uppercase text-gray-400 mb-1">Resolution Notes (visible to customer when status = resolved/closed)</label>
            <textarea className="input text-sm" rows={2} value={edit.resolution_notes}
              onChange={e => setEdit({ ...edit, resolution_notes: e.target.value })} />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button onClick={saveMeta} disabled={savingMeta} className="btn-primary disabled:opacity-60">
              {savingMeta ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Original description + attachments */}
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs uppercase text-gray-400 mb-2">Original Issue · {typeLabels[ticket.type] || ticket.type}</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          {ticket.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {ticket.attachments.map((a: any) => <Attachment key={a.id} a={a} />)}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="flex-1 p-5 space-y-4 bg-gray-50">
          <p className="text-xs uppercase text-gray-400">Activity</p>
          {events.length === 0 && <p className="text-sm text-gray-400 italic">No replies yet</p>}
          {events.map((ev, i) => ev.kind === 'comment' ? (
            <CommentBubble key={i} c={ev.data} />
          ) : (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
              <History className="w-3.5 h-3.5" />
              <strong className="text-gray-700">{ev.data.changedBy?.name || 'System'}</strong>
              <span>changed status from</span>
              <span className={`px-1.5 py-0.5 rounded ${statusColors[ev.data.from_status] || 'bg-gray-100'}`}>{ev.data.from_status || '—'}</span>
              <span>to</span>
              <span className={`px-1.5 py-0.5 rounded ${statusColors[ev.data.to_status] || 'bg-gray-100'}`}>{ev.data.to_status}</span>
              <span className="ml-auto">{fmtDate(ev.at)}</span>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="p-5 border-t border-gray-100 bg-white space-y-2 sticky bottom-0">
          <textarea className="input text-sm" rows={3} placeholder="Type your reply…"
            value={comment} onChange={e => setComment(e.target.value)} />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                  {f.name}
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="btn-outline cursor-pointer text-sm flex items-center gap-1">
              <Paperclip className="w-4 h-4" /> Attach
              <input ref={fileRef} type="file" multiple className="hidden"
                onChange={e => setFiles([...files, ...Array.from(e.target.files || [])])} />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-600">
              <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
              <Lock className="w-3.5 h-3.5" /> Internal note (hidden from customer)
            </label>
            <button onClick={send} disabled={sending} className="btn-primary ml-auto disabled:opacity-60 flex items-center gap-1.5">
              <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentBubble({ c }: any) {
  const isStaff = c.user_role === 'admin' || c.user_role === 'supervisor'
  return (
    <div className={`flex ${isStaff ? '' : 'flex-row-reverse'} gap-3`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${isStaff ? 'bg-primary-100 text-primary-700' : 'bg-blue-100 text-blue-700'}`}>
        {(c.user?.name || '?').charAt(0).toUpperCase()}
      </div>
      <div className={`flex-1 ${c.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-200'} rounded-xl p-3 max-w-[80%]`}>
        <div className="flex items-center gap-2 mb-1 text-xs">
          <strong className="text-gray-800">{c.user?.name || 'Unknown'}</strong>
          <span className="text-gray-400">· {c.user_role}</span>
          {c.is_internal && <span className="bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded font-semibold">INTERNAL</span>}
          <span className="text-gray-400 ml-auto">{fmtDate(c.created_at)}</span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.comment}</p>
        {c.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {c.attachments.map((a: any) => <Attachment key={a.id} a={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function Attachment({ a }: any) {
  const isImage = (a.file_type || '').startsWith('image/')
  return (
    <a href={a.file_url} target="_blank" rel="noopener noreferrer"
      className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 flex items-center gap-2 text-xs">
      {isImage ? (
        <img src={a.file_url} alt={a.file_name} className="w-10 h-10 object-cover rounded" />
      ) : (
        <Paperclip className="w-4 h-4 text-gray-500" />
      )}
      <div>
        <p className="font-medium text-gray-700 max-w-[180px] truncate">{a.file_name}</p>
        {a.file_size && <p className="text-[10px] text-gray-400">{Math.round(a.file_size/1024)} KB</p>}
      </div>
    </a>
  )
}

function DepartmentsModal({ departments, onClose, onChanged }: any) {
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', is_active: true })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name) { toast.error('Name required'); return }
    setSaving(true)
    try {
      if (editing) await updateComplaintDepartment(editing.id, form)
      else await createComplaintDepartment(form)
      toast.success(editing ? 'Updated' : 'Created')
      setEditing(null); setForm({ name: '', description: '', is_active: true })
      onChanged()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Deactivate this department?')) return
    try { await deleteComplaintDepartment(id); toast.success('Deactivated'); onChanged() }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2"><Building2 className="w-5 h-5" /> Departments</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>
        <div className="space-y-2">
          {departments.map((d: any) => (
            <div key={d.id} className="flex items-center gap-2 border border-gray-100 rounded-lg p-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{d.name}</p>
                {d.description && <p className="text-xs text-gray-500">{d.description}</p>}
              </div>
              {!d.is_active && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Inactive</span>}
              <button onClick={() => { setEditing(d); setForm({ name: d.name, description: d.description || '', is_active: !!d.is_active }) }}
                className="p-1.5 hover:bg-gray-100 rounded"><Edit2 className="w-4 h-4 text-gray-500" /></button>
              <button onClick={() => remove(d.id)} className="p-1.5 hover:bg-red-50 rounded"><X className="w-4 h-4 text-red-500" /></button>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-semibold">{editing ? 'Edit Department' : 'Add Department'}</p>
          <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-2">
            {editing && <button onClick={() => { setEditing(null); setForm({ name: '', description: '', is_active: true }) }} className="btn-outline flex-1">Cancel</button>}
            <button onClick={save} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              <Plus className="w-4 h-4 inline mr-1" /> {saving ? 'Saving…' : (editing ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
