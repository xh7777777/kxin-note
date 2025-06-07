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
  /** 页面图标 (emoji 或 URL) */
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
  /** 页面状态 */
  status: PageStatus;
  /** 页面权限设置 */
  permissions: PagePermission[];
  /** 页面模板 ID */
  templateId?: string;
  /** 是否为模板页面 */
  isTemplate?: boolean;
  /** 页面标签 */
  tags?: string[];
  /** 页面属性集合 */
  properties?: PageProperty[];
  /** 是否在侧边栏中展开 */
  isExpanded?: boolean;
  /** 是否为收藏页面 */
  isFavorite?: boolean;
  /** 是否为归档页面 */
  isArchived?: boolean;
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
  /** 内容哈希值，用于变更检测 */
  hash?: string;
  /** 内容长度统计 */
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
  /** 块配置参数 */
  tunes?: Record<string, any>;
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
  /** 视频 */
  VIDEO = 'video',
  /** 音频 */
  AUDIO = 'audio',
  /** 文件 */
  FILE = 'file',
  /** 链接预览 */
  LINK_PREVIEW = 'linkTool',
  /** 表格 */
  TABLE = 'table',
  /** 数学公式 */
  MATH = 'math',
  /** 待办事项 */
  CHECKLIST = 'checklist',
  /** 嵌入内容 */
  EMBED = 'embed',
  /** 子页面引用 */
  PAGE_REFERENCE = 'pageReference',
  /** 数据库 */
  DATABASE = 'database',
  /** 画板 */
  CANVAS = 'canvas',
  /** 思维导图 */
  MINDMAP = 'mindmap',
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
  | VideoBlockData
  | TableBlockData
  | ChecklistBlockData
  | PageReferenceBlockData
  | EmbedBlockData
  | Record<string, any>; // 兜底类型

/**
 * 段落块数据
 */
export interface ParagraphBlockData {
  /** 段落文本内容 */
  text: string;
  /** 文本对齐方式 */
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

/**
 * 标题块数据
 */
export interface HeaderBlockData {
  /** 标题文本 */
  text: string;
  /** 标题级别 (1-6) */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** 是否显示锚点 */
  anchor?: boolean;
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
  /** 引用对齐方式 */
  alignment?: 'left' | 'center';
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
  /** 代码主题 */
  theme?: string;
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
  /** 是否带背景 */
  withBackground?: boolean;
}

/**
 * 视频块数据
 */
export interface VideoBlockData {
  /** 视频文件信息 */
  file: FileData;
  /** 视频标题 */
  caption?: string;
  /** 是否自动播放 */
  autoplay?: boolean;
  /** 是否循环播放 */
  loop?: boolean;
  /** 是否静音 */
  muted?: boolean;
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
  displayMode: 'inline' | 'embed' | 'preview';
  /** 显示标题 */
  showTitle?: boolean;
  /** 显示图标 */
  showIcon?: boolean;
}

/**
 * 嵌入内容块数据
 */
export interface EmbedBlockData {
  /** 嵌入服务类型 */
  service: string;
  /** 嵌入 URL */
  source: string;
  /** 嵌入代码 */
  embed?: string;
  /** 显示宽度 */
  width?: number;
  /** 显示高度 */
  height?: number;
  /** 标题 */
  caption?: string;
}

/**
 * 文件数据结构
 */
export interface FileData {
  /** 文件 URL */
  url: string;
  /** 文件名 */
  name?: string;
  /** 文件大小 (字节) */
  size?: number;
  /** 文件类型 */
  type?: string;
  /** 文件哈希 */
  hash?: string;
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
  /** 创建者 ID */
  createdBy: string;
  /** 创建时间 */
  createdAt: Date;
  /** 最后编辑者 ID */
  lastEditedBy: string;
  /** 最后编辑时间 */
  lastEditedAt: Date;
  /** 页面语言 */
  language?: string;
  /** SEO 描述 */
  description?: string;
  /** SEO 关键词 */
  keywords?: string[];
  /** 页面 URL 路径 */
  slug?: string;
  /** 发布状态 */
  publishStatus: 'draft' | 'published' | 'scheduled' | 'archived';
  /** 发布时间 */
  publishedAt?: Date;
  /** 页面版本号 */
  version: number;
  /** 访问次数 */
  viewCount?: number;
  /** 最后访问时间 */
  lastViewedAt?: Date;
  /** 页面大小 (字节) */
  size?: number;
}

/**
 * 页面状态枚举
 */
export enum PageStatus {
  /** 草稿 */
  DRAFT = 'draft',
  /** 已发布 */
  PUBLISHED = 'published',
  /** 已归档 */
  ARCHIVED = 'archived',
  /** 已删除 */
  DELETED = 'deleted',
  /** 正在编辑 */
  EDITING = 'editing',
  /** 锁定中 */
  LOCKED = 'locked',
}

/**
 * 页面权限定义
 */
export interface PagePermission {
  /** 权限对象 ID (用户或组织) */
  subjectId: string;
  /** 权限对象类型 */
  subjectType: 'user' | 'group' | 'public';
  /** 权限级别 */
  permission: 'read' | 'write' | 'admin' | 'none';
  /** 权限授予时间 */
  grantedAt: Date;
  /** 权限授予者 */
  grantedBy: string;
  /** 权限过期时间 */
  expiresAt?: Date;
}

/**
 * 页面属性定义
 * 用于扩展页面的结构化数据
 */
export interface PageProperty {
  /** 属性 ID */
  id: string;
  /** 属性名称 */
  name: string;
  /** 属性类型 */
  type: PropertyType;
  /** 属性值 */
  value: PropertyValue;
  /** 是否必填 */
  required?: boolean;
  /** 属性选项 (用于选择类型) */
  options?: PropertyOption[];
}

/**
 * 页面属性类型枚举
 */
export enum PropertyType {
  /** 文本 */
  TEXT = 'text',
  /** 数字 */
  NUMBER = 'number',
  /** 日期 */
  DATE = 'date',
  /** 选择 */
  SELECT = 'select',
  /** 多选 */
  MULTI_SELECT = 'multi_select',
  /** 复选框 */
  CHECKBOX = 'checkbox',
  /** URL */
  URL = 'url',
  /** 邮箱 */
  EMAIL = 'email',
  /** 电话 */
  PHONE = 'phone',
  /** 用户 */
  PERSON = 'person',
  /** 文件 */
  FILES = 'files',
  /** 关系 */
  RELATION = 'relation',
  /** 公式 */
  FORMULA = 'formula',
}

/**
 * 属性值类型
 */
export type PropertyValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | FileData[]
  | any;

/**
 * 属性选项定义
 */
export interface PropertyOption {
  /** 选项 ID */
  id: string;
  /** 选项名称 */
  name: string;
  /** 选项颜色 */
  color?: string;
}

/**
 * 页面版本历史
 */
export interface PageVersion {
  /** 版本 ID */
  id: string;
  /** 版本号 */
  version: number;
  /** 页面内容快照 */
  content: NoteContent;
  /** 版本创建时间 */
  createdAt: Date;
  /** 版本创建者 */
  createdBy: string;
  /** 变更描述 */
  changeDescription?: string;
  /** 变更类型 */
  changeType: 'create' | 'update' | 'delete' | 'restore';
  /** 父版本 ID */
  parentVersionId?: string;
}

/**
 * 页面搜索索引
 */
export interface PageSearchIndex {
  /** 页面 ID */
  pageId: string;
  /** 页面标题 */
  title: string;
  /** 页面内容文本 */
  content: string;
  /** 搜索权重 */
  weight: number;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 笔记系统配置
 */
export interface NoteSystemConfig {
  /** 自动保存间隔 (毫秒) */
  autoSaveInterval?: number;
  /** 版本历史保留数量 */
  maxVersionHistory?: number;
  /** 是否启用协作编辑 */
  enableCollaboration?: boolean;
  /** 默认页面模板 */
  defaultTemplate?: string;
  /** 允许的文件类型 */
  allowedFileTypes?: string[];
  /** 最大文件大小 (字节) */
  maxFileSize?: number;
  /** 是否启用全文搜索 */
  enableFullTextSearch?: boolean;
}

/**
 * 页面事件类型
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
  /** 页面发布事件 */
  'page:published': { pageId: string };
  /** 页面归档事件 */
  'page:archived': { pageId: string };
  /** 页面恢复事件 */
  'page:restored': { pageId: string; versionId: string };
  /** 权限变更事件 */
  'page:permission-changed': { pageId: string; permission: PagePermission };
  /** 内容变更事件 */
  'page:content-changed': {
    pageId: string;
    blockId: string;
    changeType: 'add' | 'update' | 'delete';
  };
}
