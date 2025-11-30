import React from 'react'

const RequireAuthor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const logged = typeof window !== 'undefined' ? !!localStorage.getItem('authorUser') : false
  if (!logged) {
    window.location.href = '/login'
    return null
  }
  return <>{children}</>
}

export default RequireAuthor

