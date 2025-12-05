import React, { useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface ChapterEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'bullet' }, { list: 'ordered' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
  ['link', 'image'],
  ['clean'],
]

const ChapterEditor: React.FC<ChapterEditorProps> = ({ value, onChange, label = '章节内容', required }) => {
  const html = value || ''
  const plain = useMemo(() => html.replace(/<[^>]+>/g, ''), [html])
  const length = plain.length
  const lines = Math.max(1, plain.split(/\r?\n/).length)

  return (
    <div data-color-mode="light">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-xs text-gray-500">字数 {length} ・ 行数 {lines}</div>
      </div>
      <div className="rounded border border-gray-200 overflow-hidden bg-white">
        <ReactQuill
          theme="snow"
          value={html}
          onChange={(content: string) => onChange(content)}
          modules={{ toolbar: toolbarOptions }}
          placeholder="在此输入章节内容，支持加粗、对齐、缩进等格式"
        />
      </div>
    </div>
  )
}

export default ChapterEditor
