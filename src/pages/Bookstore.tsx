import React, { useEffect, useState } from 'react'
import { Content, ContentListResponse } from '../types/content'
import { API_BASE_URL } from '../config'
import { Link } from 'react-router-dom'

const Bookstore: React.FC = () => {
  const [items, setItems] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/contents?type=novel&status=published&limit=60`)
      const data: ContentListResponse = await res.json()
      setItems(data.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">书城</h1>
          <Link to="/login" className="text-blue-600 hover:text-blue-800">登录</Link>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">暂无书籍</p>
          </div>
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
      </div>
    </div>
  )
}

export default Bookstore

