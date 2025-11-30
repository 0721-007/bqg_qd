import React, { useState, useEffect } from 'react';
import { ContentType, Tag } from '../types/content';
import { Book, Image, Headphones, Upload, Plus, X } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { toast } from 'sonner';

const ContentUpload: React.FC = () => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [newType, setNewType] = useState({ name: '', display_name: '', description: '' });
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type_id: '',
    cover_image: '',
    metadata: {} as Record<string, any>,
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published'
  });

  const [chapters, setChapters] = useState<Array<{
    chapter_number: number;
    title: string;
    content_data: Record<string, any>;
    metadata: Record<string, any>;
  }>>([]);

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('authorUser') || '' : ''
    if (user && !formData.metadata['author']) {
      setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, author: user } }))
    }
  }, [formData.content_type_id])

  const fetchInitialData = async () => {
    try {
      const [typesResponse, tagsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/content-types`),
        fetch(`${API_BASE_URL}/tags`)
      ]);
      const typesData = await typesResponse.json();
      const tagsData = await tagsResponse.json();
      setContentTypes(typesData);
      setTags(tagsData);
    } catch (error) {
      console.error('获取初始数据失败:', error);
      toast.error('获取初始数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleContentTypeChange = (contentTypeId: string) => {
    const selectedType = contentTypes.find(type => type.id === parseInt(contentTypeId));
    if (selectedType) {
      setFormData({ ...formData, content_type_id: contentTypeId, metadata: {} });
    }
  };

  const handleMetadataChange = (key: string, value: any) => {
    setFormData({ ...formData, metadata: { ...formData.metadata, [key]: value } });
  };

  const handleTagToggle = (tagName: string) => {
    const newTags = formData.tags.includes(tagName)
      ? formData.tags.filter(t => t !== tagName)
      : [...formData.tags, tagName];
    setFormData({ ...formData, tags: newTags });
  };

  const addChapter = () => {
    const newChapter = { chapter_number: chapters.length + 1, title: '', content_data: {}, metadata: {} };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (index: number, field: string, value: any) => {
    const newChapters = [...chapters];
    if (field === 'content_data') newChapters[index].content_data = value;
    else (newChapters[index] as any)[field] = value;
    setChapters(newChapters);
  };

  const removeChapter = (index: number) => {
    const newChapters = chapters.filter((_, i) => i !== index);
    const renumberedChapters = newChapters.map((chapter, i) => ({ ...chapter, chapter_number: i + 1 }));
    setChapters(renumberedChapters);
  };

  const renderContentTypeIcon = (typeName: string) => {
    switch (typeName) {
      case 'novel': return <Book className="w-5 h-5" />
      case 'comic': return <Image className="w-5 h-5" />
      case 'audio': return <Headphones className="w-5 h-5" />
      default: return <Book className="w-5 h-5" />
    }
  };

  const zhMap: Record<string, string> = { author: '作者', genre: '分类', total_chapters: '总章节', artist: '画师', total_episodes: '总话数', narrator: '主播', duration: '时长', file_format: '文件格式' }
  const penNames: string[] = (() => { try { return JSON.parse(localStorage.getItem('authorPenNames') || '[]') } catch { return [] } })()
  const renderMetadataFields = () => {
    const selectedType = contentTypes.find(type => type.id === parseInt(formData.content_type_id));
    if (!selectedType || !selectedType.metadata_schema) return null;
    return Object.entries(selectedType.metadata_schema).map(([key, schema]: any) => {
      const label = schema.label || zhMap[key] || key
      if (key === 'author' && penNames.length > 0) {
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">作者（笔名）</label>
            <select
              value={(formData.metadata as any)[key] || penNames[0]}
              onChange={(e) => handleMetadataChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={schema.required}
            >
              {penNames.map((n, i) => (<option key={i} value={n}>{n}</option>))}
            </select>
          </div>
        )
      }
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {schema.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={(formData.metadata as any)[key] || ''}
            onChange={(e) => handleMetadataChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`请输入${label}`}
            required={schema.required}
          />
        </div>
      )
    });
  };

  const renderChapterContentFields = (chapter: any, index: number) => {
    const selectedType = contentTypes.find(type => type.id === parseInt(formData.content_type_id));
    if (!selectedType) return null;
    switch (selectedType.name) {
      case 'novel':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">章节内容 *</label>
            <textarea
              value={chapter.content_data.text || ''}
              onChange={(e) => updateChapter(index, 'content_data', { text: e.target.value })}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入章节内容"
              required
            />
          </div>
        );
      case 'comic':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">图片URLs (每行一个)</label>
            <textarea
              value={chapter.content_data.images?.join('\n') || ''}
              onChange={(e) => updateChapter(index, 'content_data', { images: e.target.value.split('\n').filter(url => url.trim()) })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入图片URL，每行一个"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">音频URL *</label>
              <input
                type="url"
                value={chapter.content_data.audio_url || ''}
                onChange={(e) => updateChapter(index, 'content_data', { ...chapter.content_data, audio_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入音频文件URL"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">时长 (秒)</label>
              <input
                type="number"
                value={chapter.content_data.duration || ''}
                onChange={(e) => updateChapter(index, 'content_data', { ...chapter.content_data, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入音频时长"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">文件格式</label>
              <select
                value={chapter.content_data.file_format || 'mp3'}
                onChange={(e) => updateChapter(index, 'content_data', { ...chapter.content_data, file_format: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="m4a">M4A</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content_type_id) { toast.error('请选择内容类型'); return; }
    if (chapters.length === 0) { toast.error('请至少添加一个章节'); return; }
    setSubmitting(true);
    try {
      const contentResponse = await fetch(`${API_BASE_URL}/contents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content_type_id: parseInt(formData.content_type_id),
          metadata: formData.metadata,
          tags: formData.tags,
          cover_image: formData.cover_image,
          status: formData.status
        })
      });
      if (!contentResponse.ok) throw new Error('创建内容失败');
      const contentData = await contentResponse.json();
      for (const chapter of chapters) {
        const chapterResponse = await fetch(`${API_BASE_URL}/contents/${contentData.id}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
          body: JSON.stringify(chapter)
        });
        if (!chapterResponse.ok) throw new Error(`创建章节失败: ${chapter.title}`);
      }
      toast.success('内容创建成功！');
      setFormData({ title: '', description: '', content_type_id: '', cover_image: '', metadata: {}, tags: [], status: 'draft' });
      setChapters([]);
    } catch (error: any) {
      console.error('提交失败:', error);
      toast.error('提交失败: ' + (error?.message || '未知错误'));
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">创建新内容</h1>
            <p className="text-gray-600 mt-1">支持小说、漫画、音频等多种内容类型</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">内容类型 *</label>
                  <select
                    value={formData.content_type_id}
                    onChange={(e) => handleContentTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">请选择内容类型</option>
                    {contentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.display_name}</option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <button type="button" onClick={() => setShowTypeForm(true)} className="text-blue-600 hover:text-blue-800 text-sm">添加新类型</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">标题 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入内容标题"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入内容描述"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">封面图片</label>
                <div className="flex items-center space-x-4">
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const fd = new FormData()
                    fd.append('file', file)
                    const headers: Record<string, string> = {}
                    if (adminPassword) headers['x-admin-password'] = adminPassword
                    const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', headers, body: fd })
                    if (!res.ok) { toast.error('上传失败'); return }
                    const data = await res.json()
                    setFormData({ ...formData, cover_image: data.url })
                    toast.success('封面上传成功')
                  }} />
                  {formData.cover_image && (
                    <img src={formData.cover_image} alt="封面预览" className="w-20 h-20 object-cover rounded" />
                  )}
                </div>
              </div>
            </div>
            {formData.content_type_id && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">详细信息</h2>
                {renderMetadataFields()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">标签</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.tags.includes(tag.name) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    style={{ backgroundColor: formData.tags.includes(tag.name) ? tag.color : undefined }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">章节</h2>
                <button type="button" onClick={addChapter} className="flex items-center space-x-2 bg-green-600 text白 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="w-4 h-4" /><span>添加章节</span>
                </button>
              </div>
              {chapters.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-4">还没有添加任何章节</p>
                  <button type="button" onClick={addChapter} className="text-blue-600 hover:text-blue-800 font-medium">添加第一个章节</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {chapters.map((chapter, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">第{chapter.chapter_number}章</h3>
                        <button type="button" onClick={() => removeChapter(index)} className="text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">章节标题 *</label>
                          <input type="text" value={chapter.title} onChange={(e) => updateChapter(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="请输入章节标题" required />
                        </div>
                      </div>
                      {renderChapterContentFields(chapter, index)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">发布设置</h2>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="status" value="draft" checked={formData.status === 'draft'} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' })} className="text-blue-600 focus:ring-blue-500" />
                  <span>草稿</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="status" value="published" checked={formData.status === 'published'} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' })} className="text-blue-600 focus:ring-blue-500" />
                  <span>立即发布</span>
                </label>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">管理员认证</h2>
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="请输入管理员密码（用于创建与更新）" />
            </div>
            {showTypeForm && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">添加内容类型</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">机器名</label>
                      <input value={newType.name} onChange={(e) => setNewType({ ...newType, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例如 novel、comic、audio" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">显示名</label>
                      <input value={newType.display_name} onChange={(e) => setNewType({ ...newType, display_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例如 小说" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                      <input value={newType.description} onChange={(e) => setNewType({ ...newType, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="类型描述" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={() => setShowTypeForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg">取消</button>
                    <button type="button" onClick={async () => {
                      if (!newType.name || !newType.display_name) return
                      const res = await fetch(`${API_BASE_URL}/content-types`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
                        body: JSON.stringify(newType)
                      })
                      if (res.ok) {
                        setShowTypeForm(false)
                        setNewType({ name: '', display_name: '', description: '' })
                        fetchInitialData()
                      } else {
                        toast.error('添加类型失败')
                      }
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">保存</button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button type="button" onClick={() => window.history.back()} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">取消</button>
              <button type="submit" disabled={submitting} className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {submitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>提交中...</span></>) : (<><Upload className="w-4 h-4" /><span>创建内容</span></>)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContentUpload;

