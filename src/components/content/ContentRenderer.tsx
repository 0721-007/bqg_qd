import React from 'react';
import { Chapter } from '../../types/content';
import { BookOpen, Image as ImageIcon, Headphones } from 'lucide-react';

interface ContentRendererProps {
  chapter: Chapter;
  contentType: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ chapter, contentType }) => {
  const renderNovelContent = (contentData: { text: string }) => (
    <div className="prose prose-lg max-w-none">
      <div className="text-gray-800 leading-relaxed whitespace-pre-line">
        {contentData.text}
      </div>
    </div>
  );

  const renderComicContent = (contentData: { images: string[]; image_descriptions?: string[] }) => (
    <div className="space-y-6">
      {contentData.images?.map((image, index) => (
        <div key={index} className="text-center">
          <img src={image} alt={contentData.image_descriptions?.[index] || `漫画第${index + 1}页`} className="max-w-full h-auto mx-auto rounded-lg shadow-md" />
          {contentData.image_descriptions?.[index] && (
            <p className="text-sm text-gray-600 mt-2">{contentData.image_descriptions[index]}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderAudioContent = (contentData: { audio_url: string; duration: number; file_format: string }) => (
    <div className="text-center space-y-4">
      <div className="bg-gray-100 rounded-lg p-6">
        <Headphones className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <audio controls className="w-full max-w-md mx-auto">
          <source src={contentData.audio_url} type={`audio/${contentData.file_format}`} />
          您的浏览器不支持音频播放。
        </audio>
        <p className="text-sm text-gray-600 mt-2">
          时长: {Math.floor(contentData.duration / 60)}:{(contentData.duration % 60).toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    try {
      const contentData = chapter.content_data as any;
      switch (contentType) {
        case 'novel':
          return renderNovelContent(contentData);
        case 'comic':
          return renderComicContent(contentData);
        case 'audio':
          return renderAudioContent(contentData);
        default:
          return (
            <div className="text-center text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
              <p>未知的内容类型</p>
            </div>
          );
      }
    } catch (error: any) {
      return (
        <div className="text-center text-red-500">
          <p>内容渲染失败</p>
          <p className="text-sm mt-2">{error?.message || '未知错误'}</p>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{chapter.title}</h1>
        <div className="flex items-center text-sm text-gray-500">
          <span>第{chapter.chapter_number}章</span>
          {chapter.published_at && (
            <>
              <span className="mx-2">•</span>
              <span>{new Date(chapter.published_at).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>
      <div className="content-body">{renderContent()}</div>
    </div>
  );
};

export default ContentRenderer;

