'use client'
import { useEffect, useState } from 'react'
import { getBlogs, createBlog, updateBlog, deleteBlog, getCityPages, upsertCityPage } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Globe, FileText } from 'lucide-react'

export default function ContentPage() {
  const [tab, setTab] = useState<'blogs' | 'cities'>('blogs')
  const [blogs, setBlogs] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [showCityForm, setShowCityForm] = useState(false)
  const [editBlog, setEditBlog] = useState<any>(null)
  const [editCity, setEditCity] = useState<any>(null)
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', category: '', status: 'draft', seo_title: '', seo_description: '' })
  const [cityForm, setCityForm] = useState({ city_name: '', state: '', hero_title: '', hero_description: '', content: '', seo_title: '', seo_description: '' })

  const load = () => {
    setLoading(true)
    Promise.all([getBlogs({ limit: 50 }), getCityPages()])
      .then(([b, c]) => { setBlogs(b.data.data.blogs); setCities(c.data.data) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const saveBlog = async () => {
    try {
      const fd = new FormData()
      Object.entries(blogForm).forEach(([k, v]) => fd.append(k, v as string))
      if (editBlog) await updateBlog(editBlog.id, fd)
      else await createBlog(fd)
      toast.success('Blog saved!'); setShowBlogForm(false); setEditBlog(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error') }
  }

  const removeBlog = async (id: number) => {
    if (!confirm('Archive this blog?')) return
    try { await deleteBlog(id); toast.success('Archived'); load() } catch { toast.error('Failed') }
  }

  const saveCity = async () => {
    try {
      await upsertCityPage(cityForm)
      toast.success('City page saved!'); setShowCityForm(false); setEditCity(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content & SEO</h1>
        <button onClick={() => tab === 'blogs' ? setShowBlogForm(true) : setShowCityForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add {tab === 'blogs' ? 'Blog' : 'City Page'}
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[['blogs', FileText, 'Blogs'], ['cities', Globe, 'City Pages']].map(([v, Icon, label]: any) => (
          <button key={v} onClick={() => setTab(v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${tab === v ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'blogs' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Published</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                  : blogs.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No blogs yet</td></tr>
                  : blogs.map(b => (
                    <tr key={b.id}>
                      <td className="font-medium max-w-xs truncate">{b.title}</td>
                      <td>{b.category || '–'}</td>
                      <td><span className={b.status === 'published' ? 'badge-green' : 'badge-gray'}>{b.status}</span></td>
                      <td>{b.views}</td>
                      <td className="text-xs text-gray-400">{b.published_at ? new Date(b.published_at).toLocaleDateString() : '–'}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => { setBlogForm(b); setEditBlog(b); setShowBlogForm(true) }} className="p-1 hover:bg-gray-100 rounded"><Edit2 className="w-3.5 h-3.5 text-gray-500" /></button>
                          <button onClick={() => removeBlog(b.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'cities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="card p-5 h-28 animate-pulse bg-gray-50" />) :
            cities.map(c => (
              <div key={c.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{c.city_name}</h3>
                    <p className="text-xs text-gray-400">{c.state} · /{c.slug}</p>
                  </div>
                  <button onClick={() => { setCityForm(c); setEditCity(c); setShowCityForm(true) }} className="p-1 hover:bg-gray-100 rounded">
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{c.hero_description || c.hero_title}</p>
              </div>
            ))}
        </div>
      )}

      {/* Blog Form Modal */}
      {showBlogForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editBlog ? 'Edit Blog' : 'New Blog Post'}</h2>
              <button onClick={() => { setShowBlogForm(false); setEditBlog(null) }} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-gray-600">Title</label>
                <input className="input mt-1" value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600">Category</label>
                  <input className="input mt-1" value={blogForm.category} onChange={e => setBlogForm({ ...blogForm, category: e.target.value })} placeholder="gardening, tips, etc." /></div>
                <div><label className="text-xs font-medium text-gray-600">Status</label>
                  <select className="input mt-1" value={blogForm.status} onChange={e => setBlogForm({ ...blogForm, status: e.target.value })}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select></div>
              </div>
              <div><label className="text-xs font-medium text-gray-600">Excerpt</label>
                <textarea className="input mt-1" rows={2} value={blogForm.excerpt} onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-gray-600">Content (HTML/Markdown)</label>
                <textarea className="input mt-1 font-mono text-xs" rows={8} value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-gray-600">SEO Title</label>
                <input className="input mt-1" value={blogForm.seo_title} onChange={e => setBlogForm({ ...blogForm, seo_title: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-gray-600">SEO Description</label>
                <textarea className="input mt-1" rows={2} value={blogForm.seo_description} onChange={e => setBlogForm({ ...blogForm, seo_description: e.target.value })} /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={saveBlog} className="btn-primary flex-1">Save Blog</button>
              <button onClick={() => { setShowBlogForm(false); setEditBlog(null) }} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* City Form Modal */}
      {showCityForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editCity ? 'Edit City Page' : 'New City Page'}</h2>
              <button onClick={() => { setShowCityForm(false); setEditCity(null) }} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600">City Name</label>
                  <input className="input mt-1" value={cityForm.city_name} onChange={e => setCityForm({ ...cityForm, city_name: e.target.value })} /></div>
                <div><label className="text-xs font-medium text-gray-600">State</label>
                  <input className="input mt-1" value={cityForm.state} onChange={e => setCityForm({ ...cityForm, state: e.target.value })} /></div>
              </div>
              <div><label className="text-xs font-medium text-gray-600">Hero Title</label>
                <input className="input mt-1" value={cityForm.hero_title} onChange={e => setCityForm({ ...cityForm, hero_title: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-gray-600">Hero Description</label>
                <textarea className="input mt-1" rows={2} value={cityForm.hero_description} onChange={e => setCityForm({ ...cityForm, hero_description: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-gray-600">Page Content</label>
                <textarea className="input mt-1" rows={4} value={cityForm.content} onChange={e => setCityForm({ ...cityForm, content: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-gray-600">SEO Title</label>
                <input className="input mt-1" value={cityForm.seo_title} onChange={e => setCityForm({ ...cityForm, seo_title: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-gray-600">SEO Description</label>
                <textarea className="input mt-1" rows={2} value={cityForm.seo_description} onChange={e => setCityForm({ ...cityForm, seo_description: e.target.value })} /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={saveCity} className="btn-primary flex-1">Save City Page</button>
              <button onClick={() => { setShowCityForm(false); setEditCity(null) }} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
