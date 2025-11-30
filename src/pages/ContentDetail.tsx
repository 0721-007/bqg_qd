import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Content, Chapter } from '../types/content';
import ContentRenderer from '../components/content/ContentRenderer';
import { ChevronLeft, ChevronRight, List, Home } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { toast } from 'sonner';

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContent();
      fetchChapters();
    }
  }, [id]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/${id}`);
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('获取内容详情失败:', error);
      toast.error('获取内容详情失败');
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/${id}/chapters`);
      const data = await response.json();
      setChapters(data.data);
      if (data.data.length > 0) {
        setCurrentChapter(data.data[0]);
      }
    } catch (error) {
      console.error('获取章节列表失败:', error);
      toast.error('获取章节列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadChapter = async (chapterId: number) => {
    try {
      setChapterLoading(true);
      const response = await fetch(`${API_BASE_URL}/contents/${id}/chapters/${chapterId}`);
      const data = await response.json();
      setCurrentChapter(data);
    } catch (error) {
      console.error('获取章节详情失败:', error);
      toast.error('获取章节详情失败');
    } finally {
      setChapterLoading(false);
    }
  };

  const handleChapterChange = (chapter: Chapter) => {
    loadChapter(chapter.id);
  };

  const handlePrevChapter = () => {
    if (!currentChapter) return;
    const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
    if (currentIndex > 0) {
      handleChapterChange(chapters[currentIndex - 1]);
    }
  };

  const handleNextChapter = () => {
    if (!currentChapter) return;
    const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
    if (currentIndex < chapters.length - 1) {
      handleChapterChange(chapters[currentIndex + 1]);
    }
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

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">内容不存在</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const currentChapterIndex = currentChapter ? chapters.findIndex(ch => ch.id === currentChapter.id) : -1;
  const hasPrevChapter = currentChapterIndex > 0;
  const hasNextChapter = currentChapterIndex < chapters.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
              >
                <Home className="w-5 h-5" />
                <span>返回首页</span>
              </Link>
              {content.cover_image && (
                <img 
                  src={content.cover_image} 
                  alt={content.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              <h1 className="text-xl font-bold text-gray-900 mb-2">{content.title}</h1>
              <p className="text-sm text-gray-600">{content.content_type_display}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                <List className="w-4 h-4" />
                <span>章节列表</span>
              </h3>
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterChange(chapter)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentChapter?.id === chapter.id
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">第{chapter.chapter_number}章</div>
                  <div className="text-sm opacity-75 truncate">{chapter.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {chapterLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">章节加载中...</p>
              </div>
            ) : currentChapter ? (
              <>
                <ContentRenderer 
                  chapter={currentChapter} 
                  contentType={content.content_type_name}
                />
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                  <button
                    onClick={handlePrevChapter}
                    disabled={!hasPrevChapter}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasPrevChapter
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>上一章</span>
                  </button>
                  <div className="text-sm text-gray-500">
                    第{currentChapter.chapter_number}章 / 共{chapters.length}章
                  </div>
                  <button
                    onClick={handleNextChapter}
                    disabled={!hasNextChapter}
                    className={`flex items中心 space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasNextChapter
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>下一章</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无章节</h3>
                <p className="text-gray-500">该内容还没有任何章节</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;

