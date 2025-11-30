import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const AuthRegister: React.FC = () => {
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    localStorage.setItem('authorUser', username.trim())
    navigate('/author')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">注册</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="请输入用户名" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700">进入作者中心</button>
        </form>
        <div className="mt-4 text-sm text-gray-600">已有账号？<Link to="/login" className="text-blue-600 hover:text-blue-800">登录</Link></div>
      </div>
    </div>
  )
}

export default AuthRegister

