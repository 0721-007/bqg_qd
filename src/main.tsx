import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import ContentList from './pages/ContentList'
import ContentDetail from './pages/ContentDetail'
import ContentUpload from './pages/ContentUpload'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ContentList />} />
        <Route path="/content/:id" element={<ContentDetail />} />
        <Route path="/admin/upload" element={<ContentUpload />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

