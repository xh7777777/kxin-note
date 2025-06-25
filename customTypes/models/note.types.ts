/**
 * 笔记关联类型
 */
export type NoteRelationType =
  | 'reference' // 引用关系
  | 'related' // 相关关系
  | 'parent-child' // 父子关系
  | 'sequence' // 序列关系
  | 'dependency' // 依赖关系
  | 'similar' // 相似关系
  | 'opposite' // 对立关系
  | 'custom'; // 自定义关系

/**
 * 笔记关联信息
 */
export interface INoteRelation {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
  relationType: NoteRelationType;
  relationLabel?: string;
  weight?: number; // 关联权重 0-1
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * FlexSearch 索引字段配置
 */
export interface INoteSearchIndex {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  // 用于搜索的扁平化文本
  searchableText: string;
  // 搜索权重字段
  titleWeight?: number;
  contentWeight?: number;
  tagsWeight?: number;
}

/**
 * 笔记元数据
 */
export interface INoteMetadata {
  title?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  icon?: string;
  cover?: string;
  attachments?: string[]; // 附件路径
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
  version: number; // 版本号，用于协作和历史记录
  language?: string; // 内容语言
  wordCount?: number; // 字数统计
  readingTime?: number; // 预估阅读时间（分钟）
}

/**
 * 笔记状态
 */
export interface INoteStatus {
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isStar: boolean;
  isTrashed: boolean;
  isReadOnly: boolean; // 是否只读
}

/**
 * 笔记统计信息
 */
export interface INoteStats {
  editCount: number;
  relationCount: number; // 关联数量
  childrenCount: number; // 子笔记数量
}

/**
 * 笔记主要接口
 */
export interface INote {
  id: string;
  metadata: INoteMetadata;
  status: INoteStatus;
  stats: INoteStats;
  // 直接关联的笔记ID列表（用于快速访问）
  relatedNoteIds: string[];
  // 搜索索引数据
  searchIndex: INoteSearchIndex;
}

/**
 * 扩展的笔记接口（包含完整关联信息）
 */
export interface INoteWithRelations extends INote {
  // 出站关联（当前笔记作为源）
  outgoingRelations: INoteRelation[];
  // 入站关联（当前笔记作为目标）
  incomingRelations: INoteRelation[];
  // 关联的笔记（可选，用于减少API调用）
  relatedNotes?: INote[];
}

/**
 * 笔记树节点（用于层次结构显示）
 */
export interface INoteTreeNode {
  note: INote;
  children: INoteTreeNode[];
  parent?: INoteTreeNode;
  depth: number;
  hasChildren: boolean;
}

/**
 * 笔记图谱节点（用于关系可视化）
 */
export interface INoteGraphNode {
  id: string;
  note: INote;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  group?: string;
}

/**
 * 笔记图谱边（用于关系可视化）
 */
export interface INoteGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: INoteRelation;
  weight?: number;
  color?: string;
  label?: string;
}

/**
 * 笔记图谱数据
 */
export interface INoteGraph {
  nodes: INoteGraphNode[];
  edges: INoteGraphEdge[];
  metadata: {
    nodeCount: number;
    edgeCount: number;
    maxDepth: number;
    categories: string[];
  };
}

/**
 * FlexSearch 搜索结果
 */
export interface ISearchResult {
  noteId: string;
  score: number;
  matchedFields: string[];
  highlights: {
    field: string;
    text: string;
    start: number;
    end: number;
  }[];
}

/**
 * 搜索建议
 */
export interface ISearchSuggestion {
  text: string;
  type: 'tag' | 'title' | 'content';
  count: number;
  score: number;
}

/**
 * 笔记索引条目
 */
export interface NoteIndexEntry {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  summary?: string;
  tags: string[];
  filePath: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  status: {
    isFavorite: boolean;
    isArchived: boolean;
    isDeleted: boolean;
    isPinned: boolean;
    isTrashed: boolean;
  };
  searchIndex: INoteSearchIndex;
}

/**
 * 笔记索引表结构
 */
export interface NoteIndex {
  version: string;
  lastUpdated: string;
  totalNotes: number;
  notes: NoteIndexEntry[];
}
