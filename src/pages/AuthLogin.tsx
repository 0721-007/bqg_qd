import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { toast } from 'sonner'

const AuthLogin: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || '登录失败')
        return
      }
      localStorage.setItem('authorUser', data.user?.username || username.trim())
      if (data.token) localStorage.setItem('authorToken', data.token)
      navigate('/author')
    } catch {
      toast.error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">登录</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="请输入用户名" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="请输入密码" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50">
            {loading ? '登录中...' : '进入作者中心'}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">没有账号？<Link to="/register" className="text-blue-600 hover:text-blue-800">注册</Link></div>
      </div>
    </div>
  )
}

export default AuthLogin

