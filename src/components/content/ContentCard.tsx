import React from 'react';
import { Content } from '../../types/content';
import { Link } from 'react-router-dom';
import { Book, Image, Headphones, Calendar, Tag } from 'lucide-react';

interface ContentCardProps {
  content: Content;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const getContentIcon = (typeName: string) => {
    switch (typeName) {
      case 'novel':
        return <Book className="w-5 h-5" />;
      case 'comic':
        return <Image className="w-5 h-5" />;
      case 'audio':
        return <Headphones className="w-5 h-5" />;
      default:
        return <Book className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { text: '已发布', class: 'bg-green-100 text-green-800' },
      draft: { text: '草稿', class: 'bg-yellow-100 text-yellow-800' },
      archived: { text: '已归档', class: 'bg-gray-100 text-gray-800' }
    } as const;
    const config = (statusConfig as any)[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="bg白 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getContentIcon(content.content_type_name)}
            <span className="text-sm text-gray-500">{content.content_type_display}</span>
          </div>
          {getStatusBadge(content.status)}
        </div>
        {content.cover_image && (
          <div className="mb-4">
            <img src={content.cover_image} alt={content.title} className="w-full h-48 object-cover rounded-lg" />
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
        {content.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{content.description}</p>
        )}
        {content.tags && content.tags.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(content.created_at).toLocaleDateString()}</span>
          </div>
          <Link to={`/content/${content.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
            查看详情 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;

