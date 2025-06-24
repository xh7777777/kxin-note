import type { INote, INoteMetadata, INoteStatus } from '../models/note.types';

/**
 * 笔记API响应结果
 */
export interface NoteAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
}

/**
 * 更新笔记的请求参数
 */
export interface UpdateNoteRequest {
  id: string;
  metadata?: Partial<INoteMetadata>;
  status?: Partial<INoteStatus>;
}

/**
 * 查询笔记的请求参数
 */
export interface QueryNotesRequest {
  keyword?: string;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  isPinned?: boolean;
  isTrashed?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 查询笔记的响应结果
 */
export interface QueryNotesResponse {
  notes: INote[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 批量操作笔记的请求参数
 */
export interface BatchNoteRequest {
  noteIds: string[];
}

/**
 * 笔记状态更新请求参数
 */
export interface UpdateNoteStatusRequest {
  id: string;
  status: Partial<INoteStatus>;
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
  getNoteById(id: string): Promise<NoteAPIResponse<INote>>;

  /**
   * 查询笔记列表
   */
  queryNotes(
    request?: QueryNotesRequest
  ): Promise<NoteAPIResponse<QueryNotesResponse>>;

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

  // 状态管理操作
  /**
   * 更新笔记状态
   */
  updateNoteStatus(
    request: UpdateNoteStatusRequest
  ): Promise<NoteAPIResponse<INote>>;

  /**
   * 收藏/取消收藏笔记
   */
  toggleFavorite(id: string): Promise<NoteAPIResponse<INote>>;

  /**
   * 归档/取消归档笔记
   */
  toggleArchive(id: string): Promise<NoteAPIResponse<INote>>;

  /**
   * 置顶/取消置顶笔记
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

  // 搜索和筛选
  /**
   * 搜索笔记
   */
  searchNotes(keyword: string): Promise<NoteAPIResponse<INote[]>>;

  /**
   * 根据标签获取笔记
   */
  getNotesByTags(tags: string[]): Promise<NoteAPIResponse<INote[]>>;

  /**
   * 获取所有标签
   */
  getAllTags(): Promise<NoteAPIResponse<string[]>>;

  /**
   * 获取收藏的笔记
   */
  getFavoriteNotes(): Promise<NoteAPIResponse<INote[]>>;

  /**
   * 获取归档的笔记
   */
  getArchivedNotes(): Promise<NoteAPIResponse<INote[]>>;

  /**
   * 获取回收站中的笔记
   */
  getTrashedNotes(): Promise<NoteAPIResponse<INote[]>>;

  /**
   * 获取置顶的笔记
   */
  getPinnedNotes(): Promise<NoteAPIResponse<INote[]>>;

  // 统计信息
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
    }>
  >;
}
