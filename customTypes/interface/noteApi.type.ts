import type {
  INote,
  INoteMetadata,
  INoteStatus,
  INoteStats,
  INoteRelation,
  INoteWithRelations,
  INoteTreeNode,
  INoteGraph,
  INoteSearchIndex,
  ISearchResult,
  ISearchSuggestion,
  NoteRelationType,
  NoteIndexEntry,
} from '../models/note.types';

/**
 * 笔记API响应结果
 */
export interface NoteAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * 创建笔记的请求参数
 */
export interface CreateNoteRequest {
  title?: string;
  content?: string;
  summary?: string;
  icon?: string;
  cover?: string;
  tags?: string[];
  attachments?: string[];
  language?: string;
  isPublic?: boolean;
  priority?: number;
  // 创建时的关联
  parentNoteId?: string;
  relatedNoteIds?: string[];
}

/**
 * 更新笔记的请求参数
 */
export interface UpdateNoteRequest {
  id: string;
  metadata?: Partial<
    Omit<INoteMetadata, 'createdAt' | 'updatedAt' | 'version'>
  >;
  status?: Partial<INoteStatus>;
  updateSearchIndex?: boolean; // 是否更新搜索索引
}

/**
 * 高级搜索请求参数
 */
export interface AdvancedSearchRequest {
  // 基础搜索
  query?: string;
  // 字段搜索
  titleQuery?: string;
  contentQuery?: string;
  tagQuery?: string[];
  authorQuery?: string;
  categoryQuery?: string;
  // 筛选条件
  dateRange?: {
    start?: string;
    end?: string;
    field?: 'createdAt' | 'updatedAt' | 'lastViewedAt';
  };
  // 状态筛选
  status?: Partial<INoteStatus>;
  // 统计筛选
  minWordCount?: number;
  maxWordCount?: number;
  minViewCount?: number;
  minRelationCount?: number;
  // 关联筛选
  hasRelations?: boolean;
  relationType?: NoteRelationType;
  relatedToNoteId?: string;
  // 排序和分页
  sortBy?: 'score' | 'createdAt' | 'updatedAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  // 搜索选项
  fuzzy?: boolean;
  exact?: boolean;
  highlight?: boolean;
  includeRelations?: boolean;
}

/**
 * 搜索响应结果
 */
export interface SearchResponse {
  results: ISearchResult[];
  notes: INote[];
  total: number;
  page: number;
  pageSize: number;
  searchTime: number; // 搜索耗时（毫秒）
  suggestions?: ISearchSuggestion[];
  facets?: {
    tags: { name: string; count: number }[];
  };
}

/**
 * 创建笔记关联请求参数
 */
export interface CreateNoteRelationRequest {
  sourceNoteId: string;
  targetNoteId: string;
  relationType: NoteRelationType;
  relationLabel?: string;
  weight?: number;
  description?: string;
}

/**
 * 批量关联操作请求参数
 */
export interface BatchRelationRequest {
  sourceNoteId: string;
  operations: {
    action: 'create' | 'update' | 'delete';
    targetNoteId: string;
    relationType?: NoteRelationType;
    relationLabel?: string;
    weight?: number;
    description?: string;
    relationId?: string; // 用于更新和删除
  }[];
}

/**
 * 图谱查询请求参数
 */
export interface GraphQueryRequest {
  centerNoteId?: string;
  maxDepth?: number;
  maxNodes?: number;
  relationTypes?: NoteRelationType[];
  includeCategories?: string[];
  excludeCategories?: string[];
  minWeight?: number;
  layout?: 'force' | 'circular' | 'hierarchical' | 'grid';
}

/**
 * 批量操作笔记的请求参数
 */
export interface BatchNoteRequest {
  noteIds: string[];
  updateSearchIndex?: boolean;
}

/**
 * 搜索索引更新请求参数
 */
export interface UpdateSearchIndexRequest {
  noteIds?: string[]; // 指定笔记ID，不传则更新全部
  forceRebuild?: boolean; // 是否强制重建索引
}

/**
 * 笔记筛选接口
 */
export interface NoteFilter {
  /** 是否在垃圾桶中 */
  isTrashed?: boolean;
  /** 是否收藏 */
  isFavorite?: boolean;
  /** 是否归档 */
  isArchived?: boolean;
  /** 是否置顶 */
  isPinned?: boolean;
  /** 标签筛选 */
  tags?: string[];
  /** 关键词搜索 */
  searchKeyword?: string;
  /** 创建时间范围 */
  createdAfter?: string;
  createdBefore?: string;
  /** 更新时间范围 */
  updatedAfter?: string;
  updatedBefore?: string;
}

/**
 * 笔记API接口
 */
export interface NoteAPI {
  // 基础CRUD操作
  /**
   * 创建笔记
   */
  createNote(request: CreateNoteRequest): Promise<NoteAPIResponse<INote>>;

  /**
   * 根据ID获取笔记
   */
  getNoteById(
    id: string,
    includeRelations?: boolean
  ): Promise<NoteAPIResponse<INote | INoteWithRelations>>;

  /**
   * 批量获取笔记
   */
  getNotesByIds(
    ids: string[],
    includeRelations?: boolean
  ): Promise<NoteAPIResponse<INote[]>>;

  /**
   * 更新笔记
   */
  updateNote(request: UpdateNoteRequest): Promise<NoteAPIResponse<INote>>;

  /**
   * 删除笔记（软删除）
   */
  deleteNote(id: string): Promise<NoteAPIResponse<boolean>>;

  /**
   * 永久删除笔记
   */
  permanentlyDeleteNote(id: string): Promise<NoteAPIResponse<boolean>>;

  // 高级搜索功能
  /**
   * 高级搜索笔记
   */
  advancedSearch(
    request: AdvancedSearchRequest
  ): Promise<NoteAPIResponse<SearchResponse>>;

  /**
   * 获取搜索建议
   */
  getSearchSuggestions(
    query: string,
    limit?: number
  ): Promise<NoteAPIResponse<ISearchSuggestion[]>>;

  /**
   * 更新搜索索引
   */
  updateSearchIndex(
    request: UpdateSearchIndexRequest
  ): Promise<NoteAPIResponse<boolean>>;

  // 笔记关联管理
  /**
   * 创建笔记关联
   */
  createNoteRelation(
    request: CreateNoteRelationRequest
  ): Promise<NoteAPIResponse<INoteRelation>>;

  /**
   * 获取笔记的所有关联
   */
  getNoteRelations(
    noteId: string,
    direction?: 'outgoing' | 'incoming' | 'both'
  ): Promise<NoteAPIResponse<INoteRelation[]>>;

  /**
   * 更新笔记关联
   */
  updateNoteRelation(
    relationId: string,
    updates: Partial<INoteRelation>
  ): Promise<NoteAPIResponse<INoteRelation>>;

  /**
   * 删除笔记关联
   */
  deleteNoteRelation(relationId: string): Promise<NoteAPIResponse<boolean>>;

  /**
   * 批量管理笔记关联
   */
  batchManageRelations(
    request: BatchRelationRequest
  ): Promise<NoteAPIResponse<INoteRelation[]>>;

  /**
   * 获取相关笔记推荐
   */
  getRelatedNotesRecommendation(
    noteId: string,
    limit?: number
  ): Promise<NoteAPIResponse<INote[]>>;

  // 图谱和树形结构
  /**
   * 获取笔记图谱数据
   */
  getNoteGraph(
    request: GraphQueryRequest
  ): Promise<NoteAPIResponse<INoteGraph>>;

  /**
   * 获取笔记树形结构
   */
  getNoteTree(
    rootNoteId?: string,
    maxDepth?: number
  ): Promise<NoteAPIResponse<INoteTreeNode[]>>;

  /**
   * 获取笔记路径（面包屑）
   */
  getNotePath(noteId: string): Promise<NoteAPIResponse<INote[]>>;

  // 状态管理操作
  /**
   * 切换收藏状态
   */
  toggleFavorite(id: string): Promise<NoteAPIResponse<INote>>;

  /**
   * 切换归档状态
   */
  toggleArchive(id: string): Promise<NoteAPIResponse<INote>>;

  /**
   * 切换置顶状态
   */
  togglePin(id: string): Promise<NoteAPIResponse<INote>>;

  /**
   * 移动到回收站
   */
  moveToTrash(id: string): Promise<NoteAPIResponse<INote>>;

  /**
   * 从回收站恢复
   */
  restoreFromTrash(id: string): Promise<NoteAPIResponse<INote>>;

  // 批量操作
  /**
   * 批量删除笔记
   */
  batchDeleteNotes(
    request: BatchNoteRequest
  ): Promise<NoteAPIResponse<boolean>>;

  /**
   * 批量归档笔记
   */
  batchArchiveNotes(
    request: BatchNoteRequest
  ): Promise<NoteAPIResponse<boolean>>;

  /**
   * 批量移动到回收站
   */
  batchMoveToTrash(
    request: BatchNoteRequest
  ): Promise<NoteAPIResponse<boolean>>;

  /**
   * 批量恢复笔记
   */
  batchRestoreNotes(
    request: BatchNoteRequest
  ): Promise<NoteAPIResponse<boolean>>;

  // 筛选和分类
  /**
   * 获取收藏的笔记
   */
  getFavoriteNotes(
    page?: number,
    pageSize?: number
  ): Promise<NoteAPIResponse<SearchResponse>>;

  /**
   * 获取归档的笔记
   */
  getArchivedNotes(
    page?: number,
    pageSize?: number
  ): Promise<NoteAPIResponse<SearchResponse>>;

  /**
   * 获取回收站中的笔记
   */
  getTrashedNotes(
    page?: number,
    pageSize?: number
  ): Promise<NoteAPIResponse<SearchResponse>>;

  /**
   * 获取置顶的笔记
   */
  getPinnedNotes(): Promise<NoteAPIResponse<INote[]>>;

  /**
   * 根据标签获取笔记
   */
  getNotesByTags(
    tags: string[],
    page?: number,
    pageSize?: number
  ): Promise<NoteAPIResponse<SearchResponse>>;

  /**
   * 根据筛选条件获取笔记列表
   */
  getNotesListByFilter: (
    filter: NoteFilter
  ) => Promise<NoteAPIResponse<NoteIndexEntry[]>>;

  // 统计和分析
  /**
   * 获取笔记统计信息
   */
  getNoteStats(): Promise<
    NoteAPIResponse<{
      total: number;
      favorite: number;
      archived: number;
      trashed: number;
      pinned: number;
      public: number;
      totalRelations: number;
      totalWords: number;
      categories: { name: string; count: number }[];
      tags: { name: string; count: number }[];
    }>
  >;

  /**
   * 获取笔记活动统计
   */
  getNoteActivity(noteId: string): Promise<NoteAPIResponse<INoteStats>>;

  /**
   * 更新笔记统计（查看、编辑等）
   */
  updateNoteStats(
    noteId: string,
    action: 'view' | 'edit' | 'share' | 'like'
  ): Promise<NoteAPIResponse<boolean>>;

  // 元数据管理
  /**
   * 获取所有标签
   */
  getAllTags(): Promise<
    NoteAPIResponse<{ name: string; count: number; color?: string }[]>
  >;

  /**
   * 获取笔记列表
   */
  getNotesList(): Promise<NoteAPIResponse<NoteIndexEntry[]>>;

  /**
   * 获取笔记存储目录
   */
  getNotesDirectory: () => Promise<string>;

  /**
   * 重建索引
   */
  rebuildIndex: () => Promise<NoteAPIResponse<boolean>>;
}
