import React from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/dist/md-editor.css'
import '@uiw/react-markdown-preview/dist/markdown.css'

interface ChapterEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

const ChapterEditor: React.FC<ChapterEditorProps> = ({ value, onChange, label = '章节内容', required }) => {
  const text = value || ''
  const length = text.length
  const lines = text.split(/\r?\n/).length

  return (
    <div data-color-mode="light">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-xs text-gray-500">字数 {length} ・ 行数 {lines}</div>
      </div>
      <div className="rounded border border-gray-200 overflow-hidden">
        <MDEditor
          value={text}
          onChange={(v: string | undefined) => onChange(v || '')}
          height={400}
        />
      </div>
    </div>
  )
}

export default ChapterEditor
