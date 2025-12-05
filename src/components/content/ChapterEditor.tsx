import React from 'react'
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor'

interface ChapterEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

const headingCommand = commands.group(
  [commands.title1, commands.title2, commands.title3],
  {
    name: 'title',
    groupName: 'title',
    buttonProps: { 'aria-label': '标题' },
  }
)

const createAlignCommand = (type: 'left' | 'center' | 'right', label: string): ICommand => ({
  name: `align-${type}`,
  keyCommand: `align-${type}`,
  buttonProps: { 'aria-label': label },
  icon: <span className="text-xs">{label}</span>,
  execute: (state, api) => {
    const selected = state.selectedText || ''
    const wrapped = `<div style="text-align:${type}">\n${selected}\n</div>\n`
    api.replaceSelection(wrapped)
  },
})

const indentCommand: ICommand = {
  name: 'indent-first-line',
  keyCommand: 'indent-first-line',
  buttonProps: { 'aria-label': '首行缩进' },
  icon: <span className="text-xs">缩进</span>,
  execute: (state, api) => {
    const selected = state.selectedText || ''
    const wrapped = `<p style="text-indent:2em;">\n${selected}\n</p>\n`
    api.replaceSelection(wrapped)
  },
}

const clearIndentCommand: ICommand = {
  name: 'clear-indent',
  keyCommand: 'clear-indent',
  buttonProps: { 'aria-label': '取消缩进' },
  icon: <span className="text-xs">还原</span>,
  execute: (state, api) => {
    const selected = state.selectedText || ''
    const cleared = selected
      .replace(/<p[^>]*style="[^"]*text-indent:[^;"}]+;?[^"]*"[^>]*>/g, '')
      .replace(/<p[^>]*>/g, '')
      .replace(/<\/p>/g, '')
    api.replaceSelection(cleared)
  },
}

const basicCommands = [
  { ...commands.bold, buttonProps: { ...(commands.bold.buttonProps || {}), 'aria-label': '加粗' } },
  { ...commands.italic, buttonProps: { ...(commands.italic.buttonProps || {}), 'aria-label': '斜体' } },
  commands.divider,
  headingCommand,
  commands.divider,
  { ...commands.link, buttonProps: { ...(commands.link.buttonProps || {}), 'aria-label': '链接' } },
  { ...commands.image, buttonProps: { ...(commands.image.buttonProps || {}), 'aria-label': '图片' } },
  commands.divider,
  {
    ...commands.unorderedListCommand,
    buttonProps: { ...(commands.unorderedListCommand.buttonProps || {}), 'aria-label': '无序列表' },
  },
  {
    ...commands.orderedListCommand,
    buttonProps: { ...(commands.orderedListCommand.buttonProps || {}), 'aria-label': '有序列表' },
  },
  commands.divider,
  {
    ...commands.codeBlock,
    buttonProps: { ...(commands.codeBlock.buttonProps || {}), 'aria-label': '代码块' },
  },
  {
    ...commands.quote,
    buttonProps: { ...(commands.quote.buttonProps || {}), 'aria-label': '引用' },
  },
  commands.divider,
  createAlignCommand('left', '左对齐'),
  createAlignCommand('center', '居中'),
  createAlignCommand('right', '右对齐'),
  commands.divider,
  indentCommand,
  clearIndentCommand,
]

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
          commands={basicCommands}
          textareaProps={{ placeholder: '在此输入章节内容，支持 Markdown 语法' }}
        />
      </div>
    </div>
  )
}

export default ChapterEditor
