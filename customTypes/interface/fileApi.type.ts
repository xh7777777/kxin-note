import type {
  FileInfo,
  FileUploadOptions,
  FileUploadResult,
  FileFilterOptions,
  FileSearchResult,
  FileStats,
  FileOperationResult,
} from '../models/file.types';

/**
 * 文件API接口
 */
export interface FileAPI {
  /**
   * 上传文件
   * @param sourcePath 源文件路径
   * @param options 上传选项
   * @returns Promise<FileUploadResult>
   */
  uploadFile: (
    sourcePath: string | Buffer,
    fileName: string,
    options: FileUploadOptions
  ) => Promise<FileUploadResult>;

  /**
   * 删除文件
   * @param fileId 文件ID
   * @returns Promise<FileOperationResult>
   */
  deleteFile: (fileId: string) => Promise<FileOperationResult>;

  /**
   * 获取文件信息
   * @param fileId 文件ID
   * @returns Promise<FileInfo | null>
   */
  getFileInfo: (fileId: string) => Promise<FileInfo | null>;

  /**
   * 获取文件列表
   * @param filter 筛选条件
   * @param page 页码
   * @param pageSize 每页数量
   * @returns Promise<FileSearchResult>
   */
  getFilesList: (
    filter: FileFilterOptions,
    page?: number,
    pageSize?: number
  ) => Promise<FileSearchResult>;

  /**
   * 获取文件统计
   * @param noteId 笔记ID（可选）
   * @returns Promise<FileStats>
   */
  getFileStats: (noteId?: string) => Promise<FileStats>;

  /**
   * 批量删除笔记文件
   * @param noteId 笔记ID
   * @returns Promise<FileOperationResult>
   */
  deleteNoteFiles: (noteId: string) => Promise<FileOperationResult>;

  /**
   * 选择文件对话框
   * @param options 对话框选项
   * @returns Promise<Electron.OpenDialogReturnValue>
   */
  selectFiles: (
    options: Electron.OpenDialogOptions
  ) => Promise<Electron.OpenDialogReturnValue>;

  /**
   * 选择目录对话框
   * @param options 对话框选项
   * @returns Promise<Electron.OpenDialogReturnValue>
   */
  selectDirectory: (
    options: Electron.OpenDialogOptions
  ) => Promise<Electron.OpenDialogReturnValue>;
}
