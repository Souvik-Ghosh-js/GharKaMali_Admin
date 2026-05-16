'use client'
import { useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { Plus, Edit2, Upload, Download, Trash2, FileSpreadsheet } from 'lucide-react'
import {
  getAdminProducts, getShopCategories, createShopProduct, updateShopProduct,
  deleteShopProduct, bulkImportProducts,
} from '@/lib/api'

type Product = {
  id: number; name: string; price: number; mrp?: number; stock_quantity?: number;
  description?: string; badge?: string; icon_key?: string; is_active?: boolean;
  tags?: string[]; category_id?: number; category?: { name: string };
}

const TEMPLATE_HEADERS = [
  'name', 'category_name', 'price', 'mrp', 'stock_quantity',
  'description', 'badge', 'icon_key', 'tags', 'is_active',
]

const TEMPLATE_SAMPLE = [
  {
    name: 'Tulsi Plant',
    category_name: 'Plants',
    price: 199,
    mrp: 249,
    stock_quantity: 50,
    description: 'Holy basil, easy to grow indoors',
    badge: 'Bestseller',
    icon_key: 'plant',
    tags: 'indoor,medicinal,sacred',
    is_active: 'true',
  },
  {
    name: 'Organic Compost 2kg',
    category_name: 'Fertilizers',
    price: 149,
    mrp: 199,
    stock_quantity: 100,
    description: '100% organic vermicompost',
    badge: '',
    icon_key: 'fertilizer',
    tags: 'organic,soil',
    is_active: 'true',
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [importResult, setImportResult] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const blank = {
    name: '', category_id: '', price: '', mrp: '', stock_quantity: '',
    description: '', badge: '', icon_key: 'plant', tags: '', is_active: true,
    image: null as File | null,
  }
  const [form, setForm] = useState<any>(blank)

  const load = () => {
    setLoading(true)
    Promise.all([getAdminProducts(), getShopCategories()])
      .then(([p, c]) => { setProducts(p.data.data || []); setCategories(c.data.data || []) })
      .catch(e => toast.error(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'image') { if (v) fd.append('image', v as File) }
        else if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v))
      })
      if (editing) await updateShopProduct(editing.id, fd)
      else await createShopProduct(fd)
      toast.success(editing ? 'Product updated' : 'Product created')
      setShowForm(false); setEditing(null); setForm(blank); load()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Deactivate this product?')) return
    try { await deleteShopProduct(id); toast.success('Product deactivated'); load() }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(TEMPLATE_SAMPLE, { header: TEMPLATE_HEADERS })
    ws['!cols'] = TEMPLATE_HEADERS.map(h => ({ wch: Math.max(14, h.length + 2) }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')

    const instructions = [
      ['Ghar Ka Mali — Product Bulk Import Template'],
      [],
      ['Column', 'Required', 'Description'],
      ['name', 'Yes', 'Product display name'],
      ['category_name', 'No', 'Existing category name (case-insensitive). Leave blank if unknown.'],
      ['price', 'Yes', 'Selling price (number, INR)'],
      ['mrp', 'No', 'MRP / strike-through price'],
      ['stock_quantity', 'No', 'Available stock (integer). Defaults to 0.'],
      ['description', 'No', 'Short product description'],
      ['badge', 'No', 'e.g. Bestseller, New, Limited'],
      ['icon_key', 'No', 'Icon identifier (default: plant)'],
      ['tags', 'No', 'Comma-separated tags, e.g. indoor,organic'],
      ['is_active', 'No', 'true / false (default true)'],
      [],
      ['Notes:'],
      ['1. Keep header row exactly as in the "Products" sheet.'],
      ['2. Remove the two sample rows before importing your data.'],
      ['3. Supported file types: .xlsx, .xls, .csv'],
    ]
    const wsi = XLSX.utils.aoa_to_sheet(instructions)
    wsi['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 60 }]
    XLSX.utils.book_append_sheet(wb, wsi, 'Instructions')

    XLSX.writeFile(wb, 'products_bulk_import_template.xlsx')
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'array' })
        const sheetName = wb.SheetNames.find(n => n.toLowerCase() === 'products') || wb.SheetNames[0]
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[sheetName], { defval: '' })
        if (!rows.length) { toast.error('Sheet is empty'); return }
        setPreview(rows)
        setImportResult(null)
      } catch (err) { toast.error('Could not parse file') }
    }
    reader.readAsArrayBuffer(file)
  }

  const submitImport = async () => {
    if (!preview.length) return
    setImporting(true)
    try {
      const res = await bulkImportProducts(preview)
      setImportResult(res.data.data)
      toast.success(res.data.message || 'Import done')
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Import failed')
    } finally { setImporting(false) }
  }

  const resetBulk = () => {
    setPreview([]); setImportResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} products</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { resetBulk(); setShowBulk(true) }} className="btn-outline flex items-center gap-2">
            <Upload className="w-4 h-4" /> Bulk Import (Excel)
          </button>
          <button onClick={() => { setEditing(null); setForm(blank); setShowForm(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-primary-600">₹{p.price}</span>
                      {p.mrp && <span className="ml-2 text-xs text-gray-400 line-through">₹{p.mrp}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.stock_quantity ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={p.is_active ? 'badge-green' : 'badge-red'}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => {
                        setEditing(p)
                        setForm({
                          name: p.name || '', category_id: p.category_id || '',
                          price: p.price || '', mrp: p.mrp || '', stock_quantity: p.stock_quantity || '',
                          description: p.description || '', badge: p.badge || '',
                          icon_key: p.icon_key || 'plant',
                          tags: Array.isArray(p.tags) ? p.tags.join(',') : (p.tags || ''),
                          is_active: p.is_active !== false, image: null,
                        })
                        setShowForm(true)
                      }} className="p-1.5 hover:bg-gray-100 rounded-lg inline-block">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => remove(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg inline-block ml-1">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!products.length && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No products yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">— None —</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input className="input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                <input className="input" type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input className="input" type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                <input className="input" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon Key</label>
                <input className="input" value={form.icon_key} onChange={e => setForm({ ...form, icon_key: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-sep)</label>
                <input className="input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input id="pa" type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="pa" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary-600" /> Bulk Import Products
              </h2>
              <button onClick={() => { setShowBulk(false); resetBulk() }} className="text-gray-400 text-2xl leading-none">×</button>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">How it works</p>
              <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                <li>Download the template below.</li>
                <li>Fill the <strong>Products</strong> sheet (delete sample rows). See <strong>Instructions</strong> sheet for column details.</li>
                <li>Upload the saved <code>.xlsx</code> / <code>.csv</code> file.</li>
                <li>Preview the rows and click <strong>Import</strong>.</li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={downloadTemplate} className="btn-outline flex items-center gap-2">
                <Download className="w-4 h-4" /> Download Template
              </button>
              <label className="btn-primary flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" /> Choose File
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
              </label>
              {preview.length > 0 && (
                <button onClick={resetBulk} className="btn-outline">Clear</button>
              )}
            </div>

            {preview.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Preview — {preview.length} row{preview.length === 1 ? '' : 's'}
                </p>
                <div className="overflow-x-auto border border-gray-100 rounded-xl max-h-72">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {Object.keys(preview[0]).map(k => (
                          <th key={k} className="text-left px-3 py-2 font-semibold text-gray-600">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 50).map((r, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          {Object.keys(preview[0]).map(k => (
                            <td key={k} className="px-3 py-1.5 text-gray-700">{String(r[k] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 50 && (
                  <p className="text-xs text-gray-400 mt-1">Showing first 50 rows of {preview.length}.</p>
                )}
              </div>
            )}

            {importResult && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm">
                <p><strong className="text-green-600">{importResult.created}</strong> created · <strong className="text-red-600">{importResult.failed}</strong> failed</p>
                {importResult.errors?.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <p className="font-semibold text-gray-700 mb-1">Errors:</p>
                    <ul className="text-xs text-red-600 space-y-0.5">
                      {importResult.errors.map((e: any, i: number) => (
                        <li key={i}>• {e.row}: {e.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowBulk(false); resetBulk() }} className="btn-outline flex-1">Close</button>
              <button onClick={submitImport} disabled={!preview.length || importing}
                className="btn-primary flex-1 disabled:opacity-60">
                {importing ? 'Importing...' : `Import ${preview.length || ''} Product${preview.length === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
