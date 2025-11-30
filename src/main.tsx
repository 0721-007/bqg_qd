import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Bookstore from './pages/Bookstore'
import ContentDetail from './pages/ContentDetail'
import ContentUpload from './pages/ContentUpload'
import AuthLogin from './pages/AuthLogin'
import AuthRegister from './pages/AuthRegister'
import ContentList from './pages/ContentList'
import AppLayout from './layout/AppLayout'
import RequireAuthor from './layout/RequireAuthor'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Bookstore />} />
          <Route path="/book/:id" element={<ContentDetail />} />
          <Route path="/login" element={<AuthLogin />} />
          <Route path="/register" element={<AuthRegister />} />
          <Route path="/author" element={<RequireAuthor><ContentUpload /></RequireAuthor>} />
          <Route path="/admin" element={<ContentList />} />
          <Route path="/admin/upload" element={<ContentUpload />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  </React.StrictMode>
)

