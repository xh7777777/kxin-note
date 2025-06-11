import type { NotePage, NoteIndexItem } from '../models/note.types';

/**
 * 笔记API接口
 */
export interface NoteAPI {
  /**
   * 创建新笔记
   * @param title 笔记标题
   * @param parentId 父页面ID
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  createNote: (
    title?: string,
    parentId?: string
  ) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 获取笔记
   * @param noteId 笔记ID
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  getNote: (noteId: string) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 更新笔记字段
   * @param noteId 笔记ID
   * @param updates 要更新的字段
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  updateNote: (
    noteId: string,
    updates: Partial<NotePage>
  ) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 删除笔记
   * @param noteId 笔记ID
   * @returns Promise<NoteAPIResponse>
   */
  deleteNote: (noteId: string) => Promise<NoteAPIResponse>;

  /**
   * 移动笔记到垃圾桶
   * @param noteId 笔记ID
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  moveToTrash: (noteId: string) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 从垃圾桶恢复笔记
   * @param noteId 笔记ID
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  restoreFromTrash: (noteId: string) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 归档笔记
   * @param noteId 笔记ID
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  archiveNote: (noteId: string) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 取消归档笔记
   * @param noteId 笔记ID
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  unarchiveNote: (noteId: string) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 切换笔记收藏状态
   * @param noteId 笔记ID
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  toggleFavorite: (noteId: string) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 获取所有笔记（从索引）
   * @returns Promise<NoteAPIResponse<NoteIndexItem[]>>
   */
  getAllNotes: () => Promise<NoteAPIResponse<NoteIndexItem[]>>;

  /**
   * 重建笔记索引
   * @returns Promise<NoteAPIResponse>
   */
  rebuildIndex: () => Promise<NoteAPIResponse>;
}

/**
 * 笔记API响应结果
 */
interface NoteAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
