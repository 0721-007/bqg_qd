import React, { useState, useEffect } from 'react';
import { Content, ContentFilters, ContentListResponse } from '../types/content';
import ContentCard from '../components/content/ContentCard';
import { Book, Image, Headphones, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGet } from '../utils/apiClient';

const ContentList: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ContentFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchContents();
  }, [filters]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      const data = await apiGet<ContentListResponse>(`/contents?${params}`);
      setContents(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('获取内容列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: ContentFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const ContentTypeFilter = () => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleFilterChange({ type: undefined })}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          !filters.type 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
      <button
        onClick={() => handleFilterChange({ type: 'novel' })}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filters.type === 'novel' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Book className="w-4 h-4" />
        <span>小说</span>
      </button>
      <button
        onClick={() => handleFilterChange({ type: 'comic' })}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filters.type === 'comic' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Image className="w-4 h-4" />
        <span>漫画</span>
      </button>
      <button
        onClick={() => handleFilterChange({ type: 'audio' })}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filters.type === 'audio' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Headphones className="w-4 h-4" />
        <span>音频</span>
      </button>
    </div>
  );

  const StatusFilter = () => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleFilterChange({ status: undefined })}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          !filters.status 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        全部状态
      </button>
      <button
        onClick={() => handleFilterChange({ status: 'published' })}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filters.status === 'published' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        已发布
      </button>
      <button
        onClick={() => handleFilterChange({ status: 'draft' })}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filters.status === 'draft' 
            ? 'bg-yellow-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        草稿
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">内容管理</h1>
            <Link
              to="/admin/upload"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>新建内容</span>
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">筛选条件</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
                <ContentTypeFilter />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">发布状态</label>
                <StatusFilter />
              </div>
            </div>
          </div>
        </div>
        {contents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Book className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无内容</h3>
            <p className="text-gray-500 mb-4">还没有任何内容，开始创建第一个吧！</p>
            <Link
              to="/admin/upload"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>创建内容</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handleFilterChange({ page })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.page === page 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentList;

