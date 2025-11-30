import React, { useEffect, useState } from 'react'
import { Content, ContentListResponse, ContentType } from '../types/content'
import { API_BASE_URL } from '../config'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

const Bookstore: React.FC = () => {
  const [items, setItems] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [types, setTypes] = useState<ContentType[]>([])
  const [activeType, setActiveType] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchTypes()
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (activeType) params.append('type', activeType)
      params.append('status', 'published')
      params.append('limit', '60')
      const res = await fetch(`${API_BASE_URL}/contents?${params}`)
      const data: ContentListResponse = await res.json()
      setItems(data.data)
    } catch (e: any) {
      toast.error('加载书籍失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchTypes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/content-types`)
      const data: ContentType[] = await res.json()
      setTypes(data)
    } catch (e: any) {
      toast.error('加载类型失败')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">书城</h1>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setActiveType(undefined); fetchData() }} className={`px-3 py-1 rounded-lg text-sm ${!activeType ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>全部</button>
                {types.map(t => (
                  <button key={t.id} onClick={() => { setActiveType(t.name); fetchData() }} className={`px-3 py-1 rounded-lg text-sm ${activeType === t.name ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t.display_name}</button>
                ))}
              </div>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-20"><p className="text-gray-500">暂无书籍</p></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {items.map(item => (
                  <Link key={item.id} to={`/book/${item.id}`} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {item.cover_image && (
                      <img src={item.cover_image} alt={item.title} className="w-full h-40 object-cover rounded-t-lg" />
                    )}
                    <div className="p-3">
                      <div className="text-sm text-gray-500 mb-1">{item.content_type_display}</div>
                      <div className="font-semibold text-gray-900 truncate">{item.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Bookstore

