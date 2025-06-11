/**
 * 文件管理系统类型定义
 * File Management System Type Definitions
 */

/**
 * 文件信息接口
 */
export interface FileInfo {
  /** 文件唯一标识符 */
  id: string;
  /** 文件名 */
  name: string;
  /** 文件原始名称 */
  originalName: string;
  /** 文件扩展名 */
  extension: string;
  /** 文件大小 (字节) */
  size: number;
  /** 文件MIME类型 */
  mimeType: string;
  /** 文件在文件系统中的相对路径 */
  relativePath: string;
  /** 文件的绝对路径 */
  absolutePath: string;
  /** 关联的笔记ID */
  noteId: string;
  /** 文件用途类型 */
  fileType: FileUsageType;
  /** 文件创建时间 */
  createdAt: Date;
  /** 文件最后修改时间 */
  updatedAt: Date;
  /** 文件MD5哈希值 */
  hash?: string;
  /** 文件描述/备注 */
  description?: string;
  /** 文件标签 */
  tags?: string[];
}

/**
 * 文件用途类型枚举
 */
export enum FileUsageType {
  /** 笔记封面图片 */
  COVER = 'cover',
  /** 内容中的图片 */
  IMAGE = 'image',
  /** 附件文档 */
  ATTACHMENT = 'attachment',
  /** 音频文件 */
  AUDIO = 'audio',
  /** 视频文件 */
  VIDEO = 'video',
  /** 其他类型 */
  OTHER = 'other',
}

/**
 * 文件上传选项
 */
export interface FileUploadOptions {
  /** 目标笔记ID */
  noteId: string;
  /** 文件用途类型 */
  fileType: FileUsageType;
  /** 是否生成缩略图 */
  generateThumbnail?: boolean;
  /** 图片压缩质量 (0-1) */
  imageQuality?: number;
  /** 文件描述 */
  description?: string;
  /** 文件标签 */
  tags?: string[];
}

/**
 * 文件上传结果
 */
export interface FileUploadResult {
  /** 是否上传成功 */
  success: boolean;
  /** 上传的文件信息 */
  fileInfo?: FileInfo;
  /** 错误信息 */
  error?: string;
  /** 错误代码 */
  errorCode?: FileErrorCode;
}

/**
 * 文件错误代码枚举
 */
export enum FileErrorCode {
  /** 文件不存在 */
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  /** 文件大小超限 */
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  /** 不支持的文件类型 */
  UNSUPPORTED_TYPE = 'UNSUPPORTED_TYPE',
  /** 磁盘空间不足 */
  INSUFFICIENT_SPACE = 'INSUFFICIENT_SPACE',
  /** 权限不足 */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 文件筛选选项
 */
export interface FileFilterOptions {
  /** 按笔记ID筛选 */
  noteId?: string;
  /** 按文件类型筛选 */
  fileType?: FileUsageType;
  /** 按文件扩展名筛选 */
  extensions?: string[];
  /** 按大小范围筛选 */
  sizeRange?: {
    min?: number;
    max?: number;
  };
  /** 按创建时间范围筛选 */
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  /** 按标签筛选 */
  tags?: string[];
}

/**
 * 文件搜索结果
 */
export interface FileSearchResult {
  /** 文件列表 */
  files: FileInfo[];
  /** 总数量 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 文件统计信息
 */
export interface FileStats {
  /** 总文件数量 */
  totalCount: number;
  /** 总文件大小 */
  totalSize: number;
  /** 按类型分类的统计 */
  byType: Record<
    FileUsageType,
    {
      count: number;
      size: number;
    }
  >;
  /** 按扩展名分类的统计 */
  byExtension: Record<
    string,
    {
      count: number;
      size: number;
    }
  >;
}

/**
 * 文件操作结果
 */
export interface FileOperationResult {
  /** 是否操作成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 错误代码 */
  errorCode?: FileErrorCode;
  /** 操作的文件数量 */
  affectedCount?: number;
}

/**
 * 文件导入选项
 */
export interface FileImportOptions {
  /** 源文件路径列表 */
  sourcePaths: string[];
  /** 目标笔记ID */
  noteId: string;
  /** 文件用途类型 */
  fileType: FileUsageType;
  /** 是否复制文件 */
  copyFiles?: boolean;
  /** 是否覆盖同名文件 */
  overwrite?: boolean;
}

/**
 * 文件导出选项
 */
export interface FileExportOptions {
  /** 文件ID列表 */
  fileIds: string[];
  /** 目标目录 */
  targetDirectory: string;
  /** 是否保持目录结构 */
  preserveStructure?: boolean;
  /** 是否包含元数据 */
  includeMetadata?: boolean;
}

/**
 * 缩略图配置
 */
export interface ThumbnailConfig {
  /** 缩略图宽度 */
  width: number;
  /** 缩略图高度 */
  height: number;
  /** 图片质量 */
  quality: number;
  /** 输出格式 */
  format: 'jpeg' | 'png' | 'webp';
}

/**
 * 文件索引项
 */
export interface FileIndexItem {
  id: string;
  name: string;
  noteId: string;
  fileType: FileUsageType;
  size: number;
  relativePath: string;
  createdAt: string;
  updatedAt: string;
  hash?: string;
}

/**
 * 文件索引
 */
export interface FileIndex {
  version: string;
  lastUpdated: string;
  files: FileIndexItem[];
}
