import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const user = typeof window !== 'undefined' ? localStorage.getItem('authorUser') : null

  const logout = () => {
    localStorage.removeItem('authorUser')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl text-gray-900">笔趣阁</Link>
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600">书城</Link>
            {user ? (
              <>
                <Link to="/author" className="text-gray-700 hover:text-blue-600">作者中心</Link>
                <button onClick={logout} className="text-gray-700 hover:text-blue-600">退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">登录</Link>
                <Link to="/register" className="text-gray-700 hover:text-blue-600">注册</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <Toaster richColors position="top-center" />
    </div>
  )
}

export default AppLayout

