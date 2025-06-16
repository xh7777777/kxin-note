/**
 * 笔记系统类型定义
 * Note System Type Definitions
 */

/**
 * 笔记页面主体定义
 * 每个页面都是一个独立的笔记单元，支持嵌套子页面
 */
export interface NotePage {
  /** 页面唯一标识符 */
  id: string;
  /** 页面标题 */
  title: string;
  /** 页面图标 (emoji) */
  icon?: string;
  /** 页面封面图片 URL */
  cover?: string;
  /** 父页面 ID，null 表示根页面 */
  parentId?: string;
  /** 子页面列表 */
  children?: NotePage[];
  /** 页面层级深度，0 为根页面 */
  level: number;
  /** 页面内容数据 (EditorJS 格式) */
  content: NoteContent;
  /** 页面元数据 */
  metadata: PageMetadata;
  /** 页面标签 */
  tags?: string[];
  /** 是否在侧边栏中展开 */
  isExpanded?: boolean;
  /** 是否为收藏页面 */
  isFavorite?: boolean;
  /** 是否为归档页面 */
  isArchived?: boolean;
  /** 是否在垃圾桶中 */
  isInTrash?: boolean;
  /** 页面排序权重 */
  order?: number;
}

/**
 * EditorJS 内容数据结构
 * 包含页面的所有块内容和版本信息
 */
export interface NoteContent {
  /** 内容创建时间戳 */
  time: number;
  /** EditorJS 版本 */
  version: string;
  /** 内容块数组 */
  blocks: NoteBlock[];
  /** 内容统计 */
  stats?: ContentStats;
}

/**
 * EditorJS 内容块定义
 * 表示页面中的一个可编辑块
 */
export interface NoteBlock {
  /** 块唯一标识符 */
  id: string;
  /** 块类型 */
  type: BlockType;
  /** 块数据内容 */
  data: BlockData;
  /** 块创建时间 */
  createdAt?: number;
  /** 块更新时间 */
  updatedAt?: number;
}

/**
 * 支持的块类型枚举
 */
export enum BlockType {
  /** 段落文本 */
  PARAGRAPH = 'paragraph',
  /** 标题 */
  HEADER = 'header',
  /** 列表 */
  LIST = 'list',
  /** 引用 */
  QUOTE = 'quote',
  /** 代码块 */
  CODE = 'code',
  /** 分隔线 */
  DELIMITER = 'delimiter',
  /** 图片 */
  IMAGE = 'image',
  /** 文件 */
  FILE = 'file',
  /** 链接预览 */
  LINK_PREVIEW = 'linkTool',
  /** 表格 */
  TABLE = 'table',
  /** 待办事项 */
  CHECKLIST = 'checklist',
  /** 子页面引用 */
  PAGE_REFERENCE = 'pageReference',
}

/**
 * 块数据内容
 * 根据不同块类型包含不同的数据结构
 */
export type BlockData =
  | ParagraphBlockData
  | HeaderBlockData
  | ListBlockData
  | QuoteBlockData
  | CodeBlockData
  | ImageBlockData
  | TableBlockData
  | ChecklistBlockData
  | PageReferenceBlockData
  | Record<string, any>; // 兜底类型

/**
 * 段落块数据
 */
export interface ParagraphBlockData {
  /** 段落文本内容 */
  text: string;
  /** 文本对齐方式 */
  alignment?: 'left' | 'center' | 'right';
}

/**
 * 标题块数据
 */
export interface HeaderBlockData {
  /** 标题文本 */
  text: string;
  /** 标题级别 (1-6) */
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * 列表块数据
 */
export interface ListBlockData {
  /** 列表样式 */
  style: 'ordered' | 'unordered';
  /** 列表项数组 */
  items: string[];
}

/**
 * 引用块数据
 */
export interface QuoteBlockData {
  /** 引用文本 */
  text: string;
  /** 引用来源 */
  caption?: string;
}

/**
 * 代码块数据
 */
export interface CodeBlockData {
  /** 代码内容 */
  code: string;
  /** 编程语言 */
  language?: string;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
}

/**
 * 图片块数据
 */
export interface ImageBlockData {
  /** 图片文件信息 */
  file: FileData;
  /** 图片标题 */
  caption?: string;
  /** 是否拉伸显示 */
  stretched?: boolean;
  /** 是否带边框 */
  withBorder?: boolean;
}

/**
 * 表格块数据
 */
export interface TableBlockData {
  /** 是否包含表头 */
  withHeadings?: boolean;
  /** 表格内容 (二维数组) */
  content: string[][];
}

/**
 * 待办事项块数据
 */
export interface ChecklistBlockData {
  /** 待办事项列表 */
  items: ChecklistItem[];
}

/**
 * 待办事项
 */
export interface ChecklistItem {
  /** 项目文本 */
  text: string;
  /** 是否已完成 */
  checked: boolean;
  /** 项目 ID */
  id?: string;
}

/**
 * 页面引用块数据
 */
export interface PageReferenceBlockData {
  /** 引用的页面 ID */
  pageId: string;
  /** 显示模式 */
  displayMode: 'inline' | 'preview';
  /** 显示标题 */
  showTitle?: boolean;
  /** 显示图标 */
  showIcon?: boolean;
}

/**
 * 文件数据结构
 */
export interface FileData {
  /** 文件 URL 或本地路径 */
  url: string;
  /** 文件名 */
  name?: string;
  /** 文件大小 (字节) */
  size?: number;
  /** 文件类型 */
  type?: string;
  /** 上传时间 */
  uploadedAt?: Date;
}

/**
 * 内容统计信息
 */
export interface ContentStats {
  /** 字符数 */
  characters: number;
  /** 单词数 */
  words: number;
  /** 段落数 */
  paragraphs: number;
  /** 阅读时间 (分钟) */
  readingTime: number;
  /** 块数量 */
  blockCount: number;
  /** 图片数量 */
  imageCount: number;
}

/**
 * 页面元数据
 */
export interface PageMetadata {
  /** 创建时间 */
  createdAt: Date;
  /** 最后编辑时间 */
  updatedAt: Date;
  /** 页面大小 (字节) */
  size?: number;
  /** 页面状态 */
  status: PageStatus;
}

/**
 * 页面状态枚举
 */
export enum PageStatus {
  /** 草稿 */
  DRAFT = 'draft',
  /** 正常 */
  NORMAL = 'normal',
  /** 已归档 */
  ARCHIVED = 'archived',
  /** 已删除 */
  DELETED = 'deleted',
}

/**
 * 笔记系统配置
 */
export interface NoteSystemConfig {
  /** 自动保存间隔 (毫秒) */
  autoSaveInterval?: number;
  /** 默认页面图标 */
  defaultIcon?: string;
  /** 允许的文件类型 */
  allowedFileTypes?: string[];
  /** 最大文件大小 (字节) */
  maxFileSize?: number;
  /** 数据存储路径 */
  dataPath?: string;
}

/**
 * 页面搜索结果
 */
export interface SearchResult {
  /** 页面 ID */
  pageId: string;
  /** 页面标题 */
  title: string;
  /** 匹配的内容摘要 */
  snippet: string;
  /** 匹配分数 */
  score: number;
}

/**
 * 笔记树节点
 * 用于侧边栏显示的简化结构
 */
export interface NoteTreeNode {
  /** 页面 ID */
  id: string;
  /** 页面标题 */
  title: string;
  /** 页面图标 */
  icon?: string;
  /** 父页面 ID */
  parentId?: string;
  /** 子页面 */
  children?: NoteTreeNode[];
  /** 层级深度 */
  level: number;
  /** 是否展开 */
  isExpanded?: boolean;
  /** 是否收藏 */
  isFavorite?: boolean;
  /** 是否归档 */
  isArchived?: boolean;
  /** 最后更新时间 */
  updatedAt: Date;
}

/**
 * 页面操作事件
 */
export interface PageEvents {
  /** 页面创建事件 */
  'page:created': { page: NotePage };
  /** 页面更新事件 */
  'page:updated': { pageId: string; changes: Partial<NotePage> };
  /** 页面删除事件 */
  'page:deleted': { pageId: string };
  /** 页面移动事件 */
  'page:moved': { pageId: string; oldParentId?: string; newParentId?: string };
}

export interface NoteIndexItem {
  id: string;
  title: string;
  icon?: string;
  filePath: string;
  updatedAt: string;
  createdAt: string;
  parentId?: string;
  level: number;
  isFavorite?: boolean;
  isArchived?: boolean;
  isInTrash?: boolean;
}

/**
 * 笔记索引接口
 */
export interface NoteIndex {
  version: string;
  lastUpdated: string;
  notes: NoteIndexItem[];
}
