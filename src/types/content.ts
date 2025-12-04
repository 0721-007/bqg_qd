export interface ContentType {
  id: number;
  name: string;
  display_name: string;
  description: string;
  metadata_schema: Record<string, any>;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Content {
  id: number;
  content_type_id: number;
  title: string;
  description: string;
  cover_image: string;
  metadata: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  content_type_name: string;
  content_type_display: string;
  tags: string[];
  author_user_id?: number;
  author_username?: string;
}

export interface Chapter {
  id: number;
  content_id: number;
  chapter_number: number;
  title: string;
  content_data: Record<string, any>;
  metadata: Record<string, any>;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContentFilters {
  type?: string;
  status?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ContentListResponse {
  data: Content[];
  pagination: PaginationData;
}

export interface NovelContentData { text: string }
export interface ComicContentData { images: string[]; image_descriptions?: string[] }
export interface AudioContentData { audio_url: string; duration: number; file_format: string }
export type ChapterContentData = NovelContentData | ComicContentData | AudioContentData

