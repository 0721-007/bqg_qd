import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config'
import { Content, ContentListResponse, Chapter } from '../types/content'
import { toast } from 'sonner'
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiClient'
import ChapterEditor from '../components/content/ChapterEditor'

const ChapterManager: React.FC<{ content: Content; adminPassword: string }> = ({ content, adminPassword }) => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState<Partial<Chapter> & { id?: number }>({})

  const fetchChapters = async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ data: Chapter[] }>(`/contents/${content.id}/chapters`)
      setChapters(data.data || [])
    } catch {
      toast.error('加载章节失败')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchChapters() }, [content.id])

  const resetEdit = () => setEdit({})

  const saveChapter = async () => {
    try {
      const body = {
        chapter_number: edit.chapter_number,
        title: edit.title,
        content_data: edit.content_data || { text: '' },
        metadata: edit.metadata || {}
      }
      const path = edit.id
        ? `/contents/${content.id}/chapters/${edit.id}`
        : `/contents/${content.id}/chapters`
      if (edit.id) {
        await apiPut(path, body)
      } else {
        await apiPost(path, body)
      }
      toast.success('章节已保存')
      resetEdit()
      fetchChapters()
    } catch (e: any) { toast.error(e.message || '保存章节失败') }
  }

  const deleteChapter = async (id: number) => {
    try {
      await apiDelete(`/contents/${content.id}/chapters/${id}`, { adminPassword })
      toast.success('章节已删除')
      fetchChapters()
    } catch (e: any) { toast.error(e.message || '删除章节失败') }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">章节管理</h3>
      {loading ? (
        <div className="text-gray-500">加载中...</div>
      ) : (
        <div className="space-y-2">
          {chapters.map(ch => (
            <div key={ch.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">第{ch.chapter_number}章 {ch.title}</div>
              </div>
              <div className="space-x-2">
                <button onClick={() => setEdit({ id: ch.id, chapter_number: ch.chapter_number, title: ch.title, content_data: ch.content_data })} className="px-3 py-1 bg-blue-600 text-white rounded">编辑</button>
                <button onClick={() => deleteChapter(ch.id)} className="px-3 py-1 bg-red-600 text-white rounded">删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="border rounded p-4 space-y-3">
        <div className="font-semibold">{edit.id ? '编辑章节' : '新增章节'}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="number" placeholder="章节编号" value={edit.chapter_number as any || ''} onChange={e => setEdit({ ...edit, chapter_number: parseInt(e.target.value) || 1 })} className="px-3 py-2 border rounded" />
          <input type="text" placeholder="章节标题" value={edit.title || ''} onChange={e => setEdit({ ...edit, title: e.target.value })} className="px-3 py-2 border rounded" />
        </div>
        <ChapterEditor
          value={(edit.content_data as any)?.text || ''}
          onChange={text => setEdit({ ...edit, content_data: { text } })}
          label="章节内容"
          required
        />
        <div className="space-x-2">
          <button onClick={saveChapter} className="px-4 py-2 bg-green-600 text-white rounded">保存</button>
          {edit.id && (<button onClick={resetEdit} className="px-4 py-2 border rounded">取消</button>)}
        </div>
      </div>
    </div>
  )
}

const AuthorDashboard: React.FC = () => {
  const username = typeof window !== 'undefined' ? localStorage.getItem('authorUser') || '' : ''
  const [adminPassword, setAdminPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'list'|'new'|'chapters'|'edit'>('list')
  const [items, setItems] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Content | null>(null)
  const [showMine, setShowMine] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [edit, setEdit] = useState<Partial<Content> & { id?: number }>({})
  const [penNames, setPenNames] = useState<string[]>([])
  const [showPenPanel, setShowPenPanel] = useState(false)
  const [newPen, setNewPen] = useState('')

  const statusLabel: Record<string, string> = { draft: '草稿', published: '已发布', archived: '已归档' }

  const fetchContents = async () => {
    try {
      setLoading(true)
      const data = await apiGet<ContentListResponse>('/contents?limit=100')
      let list = data.data || []
      if (showMine) {
        const current = (username || '').toLowerCase()
        list = list.filter(c => {
          const owner = (c.author_username || '').toLowerCase()
          if (owner && current) return owner === current
          const authors = (penNames.length ? penNames : (username ? [username] : [])).map(a => a.toLowerCase())
          if (!authors.length) return true
          return authors.includes((c.metadata?.author || '').toLowerCase())
        })
      }
      if (keyword) list = list.filter(c => c.title.toLowerCase().includes(keyword.toLowerCase()))
      setItems(list)
    } catch {
      toast.error('加载书籍失败')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchContents() }, [])
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('authorPenNames') || '[]') : []
      if (Array.isArray(saved)) setPenNames(saved.filter(Boolean))
    } catch {}
  }, [])
  useEffect(() => { if (showMine) fetchContents() }, [penNames.join(','), showMine])

  const removeContent = async (id: number) => {
    try {
      await apiDelete(`/contents/${id}`, { adminPassword })
      toast.success('已删除书籍')
      fetchContents()
    } catch (e: any) { toast.error(e.message || '删除书籍失败') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">作者中心</h1>
          <div className="flex items-center space-x-3">
            <button onClick={() => setShowPenPanel(!showPenPanel)} className="px-3 py-2 border rounded">管理笔名</button>
            <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="管理员密码（用于删除）" className="px-3 py-2 border rounded" />
          </div>
        </div>

        <div className="mb-4 flex space-x-2">
          <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded ${activeTab==='list'?'bg-blue-600 text-white':'bg-white border'}`}>我的书籍</button>
          <button onClick={() => setActiveTab('new')} className={`px-4 py-2 rounded ${activeTab==='new'?'bg-blue-600 text-white':'bg-white border'}`}>新建书籍</button>
          {selected && (
            <button onClick={() => setActiveTab('chapters')} className={`px-4 py-2 rounded ${activeTab==='chapters'?'bg-blue-600 text-white':'bg-white border'}`}>管理章节：{selected.title}</button>
          )}
        </div>

        {activeTab === 'list' && (
          <div className="bg-white rounded shadow-sm p-4 overflow-x-auto">
            <div className="flex items-center gap-3 mb-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={showMine} onChange={e => { setShowMine(e.target.checked); fetchContents() }} />
                <span>只看我的（作者：{penNames.length ? penNames.join('、') : (username || '未登录')}）</span>
              </label>
              <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="按标题搜索" className="px-3 py-2 border rounded" />
              <button onClick={fetchContents} className="px-3 py-2 bg-blue-600 text-white rounded">刷新</button>
            </div>
            {loading ? (
              <div className="text-gray-500">加载中...</div>
            ) : items.length === 0 ? (
              <div className="text-gray-500">暂无书籍，点击上方“新建书籍”。</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">标题</th>
                    <th className="py-2">类型</th>
                    <th className="py-2">状态</th>
                    <th className="py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(c => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2">{c.title}</td>
                      <td className="py-2">{c.content_type_display}</td>
                      <td className="py-2">{statusLabel[c.status] || c.status}</td>
                      <td className="py-2 space-x-2">
                        <button onClick={() => { setSelected(c); setActiveTab('chapters') }} className="px-3 py-1 bg-blue-600 text-white rounded">章节</button>
                        <button onClick={() => { setSelected(c); setEdit({ id: c.id, title: c.title, description: c.description, cover_image: c.cover_image, status: c.status, metadata: c.metadata }); setActiveTab('edit') }} className="px-3 py-1 bg-yellow-600 text-white rounded">编辑</button>
                        <button onClick={() => removeContent(c.id)} className="px-3 py-1 bg-red-600 text-white rounded">删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {showPenPanel && (
          <div className="bg-white rounded shadow-sm p-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">笔名管理</h3>
            <div className="flex items-center gap-2 mb-3">
              <input value={newPen} onChange={e => setNewPen(e.target.value)} placeholder="输入笔名" className="px-3 py-2 border rounded" />
              <button onClick={() => { const v = newPen.trim(); if (!v) return; const next = Array.from(new Set([...penNames, v])); setPenNames(next); setNewPen(''); localStorage.setItem('authorPenNames', JSON.stringify(next)) }} className="px-3 py-2 bg-blue-600 text-white rounded">添加</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {penNames.map((n, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 rounded inline-flex items-center gap-2">
                  {n}
                  <button onClick={() => { const next = penNames.filter(x => x !== n); setPenNames(next); localStorage.setItem('authorPenNames', JSON.stringify(next)); }} className="text-red-600">×</button>
                </span>
              ))}
              {penNames.length === 0 && (<span className="text-gray-500">尚未添加笔名，默认使用登录名</span>)}
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="bg-white rounded shadow-sm p-4">
            <div className="text-gray-500 mb-3">请到“创建内容”页完成书籍创建与首章编写。</div>
            <a href="/admin/upload" className="px-4 py-2 bg-blue-600 text-white rounded inline-block">打开创建内容</a>
          </div>
        )}

        {activeTab === 'chapters' && selected && (
          <div className="bg白 rounded shadow-sm p-4">
            <ChapterManager content={selected} adminPassword={adminPassword} />
          </div>
        )}

        {activeTab === 'edit' && edit.id && (
          <div className="bg-white rounded shadow-sm p-4 space-y-3">
            <h3 className="text-lg font-semibold">编辑书籍</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" value={edit.title || ''} onChange={e => setEdit({ ...edit, title: e.target.value })} placeholder="标题" className="px-3 py-2 border rounded" />
              <select value={(edit.status as any) || 'draft'} onChange={e => setEdit({ ...edit, status: e.target.value as any })} className="px-3 py-2 border rounded">
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>
            <textarea rows={4} value={edit.description || ''} onChange={e => setEdit({ ...edit, description: e.target.value })} placeholder="描述" className="w-full px-3 py-2 border rounded" />
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const fd = new FormData()
                fd.append('file', file)
                const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd })
                if (!res.ok) { toast.error('上传失败'); return }
                const data = await res.json()
                setEdit({ ...edit, cover_image: data.url })
              }} />
              {edit.cover_image && <img src={edit.cover_image} alt="封面" className="w-20 h-20 object-cover rounded" />}
            </div>
            <div className="flex gap-2">
              <button onClick={async () => {
                try {
                  await apiPut(`/contents/${edit.id}`, { title: edit.title, description: edit.description, cover_image: edit.cover_image, status: edit.status, metadata: edit.metadata })
                  toast.success('书籍已更新')
                  setActiveTab('list')
                  fetchContents()
                } catch (e: any) { toast.error(e.message || '保存失败') }
              }} className="px-4 py-2 bg-green-600 text-white rounded">保存</button>
              <button onClick={() => setActiveTab('list')} className="px-4 py-2 border rounded">取消</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthorDashboard
