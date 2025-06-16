import { ipcMain, dialog } from 'electron';
import { promises as fs, existsSync, statSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { v4 as uuidv4 } from 'uuid';

import {
  FileInfo,
  FileUploadOptions,
  FileUploadResult,
  FileFilterOptions,
  FileStats,
  FileOperationResult,
  FileUsageType,
  FileErrorCode,
} from '../../../customTypes/models/file.types';

import { getNoteDirectoryPath } from './note-action-hook';

/**
 * 获取文件元数据路径
 */
const getFileMetadataPath = (noteId: string, fileId: string): string => {
  return join(getNoteDirectoryPath(noteId), `${fileId}.json`);
};

/**
 * 确保目录存在
 */
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  if (!existsSync(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * 获取文件MIME类型
 */
const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * 生成唯一的文件名
 */
const generateUniqueFileName = (
  originalName: string,
  noteId: string
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = extname(originalName);
  const baseName = basename(originalName, extension);
  return `${noteId}_${baseName}_${timestamp}_${random}${extension}`;
};

/**
 * 保存文件元数据
 */
const saveFileMetadata = async (fileInfo: FileInfo): Promise<void> => {
  const metadataPath = getFileMetadataPath(fileInfo.noteId, fileInfo.id);
  await ensureDirectoryExists(dirname(metadataPath));

  const metadata = {
    id: fileInfo.id,
    name: fileInfo.name,
    originalName: fileInfo.originalName,
    extension: fileInfo.extension,
    size: fileInfo.size,
    mimeType: fileInfo.mimeType,
    absolutePath: fileInfo.absolutePath,
    noteId: fileInfo.noteId,
    fileType: fileInfo.fileType,
    createdAt: fileInfo.createdAt.toISOString(),
    updatedAt: fileInfo.updatedAt.toISOString(),
    isDeleted: fileInfo.isDeleted,
    deletedAt: fileInfo.deletedAt?.toISOString(),
    description: fileInfo.description,
  };

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
};

/**
 * 加载文件元数据
 */
const loadFileMetadata = async (
  noteId: string,
  fileId: string
): Promise<FileInfo | null> => {
  try {
    const metadataPath = getFileMetadataPath(noteId, fileId);

    if (!existsSync(metadataPath)) {
      return null;
    }

    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    return {
      id: metadata.id,
      name: metadata.name,
      originalName: metadata.originalName,
      extension: metadata.extension,
      size: metadata.size,
      mimeType: metadata.mimeType,
      absolutePath: metadata.absolutePath,
      noteId: metadata.noteId,
      fileType: metadata.fileType,
      createdAt: new Date(metadata.createdAt),
      updatedAt: new Date(metadata.updatedAt),
      isDeleted: metadata.isDeleted || false,
      deletedAt: metadata.deletedAt ? new Date(metadata.deletedAt) : undefined,
      description: metadata.description,
    };
  } catch (error) {
    console.error('加载文件元数据失败:', error);
    return null;
  }
};

/**
 * 获取笔记下的所有文件元数据
 */
const loadNoteFileMetadata = async (
  noteId: string,
  includeDeleted = false
): Promise<FileInfo[]> => {
  try {
    const noteFilesPath = getNoteDirectoryPath(noteId);

    if (!existsSync(noteFilesPath)) {
      return [];
    }

    const files = await fs.readdir(noteFilesPath);
    const metadataFiles = files.filter(file => file.endsWith('.json'));

    const fileInfos: FileInfo[] = [];

    for (const metadataFile of metadataFiles) {
      const fileId = metadataFile.replace('.json', '');
      const fileInfo = await loadFileMetadata(noteId, fileId);

      if (fileInfo && (includeDeleted || !fileInfo.isDeleted)) {
        fileInfos.push(fileInfo);
      }
    }

    return fileInfos;
  } catch (error) {
    console.error('加载笔记文件元数据失败:', error);
    return [];
  }
};

/**
 * 上传文件
 */
const uploadFile = async (
  sourceData: string | Buffer,
  fileName: string,
  options: FileUploadOptions
): Promise<FileUploadResult> => {
  console.log(fileName, options, 11111);
  try {
    let fileContent: Buffer;
    let fileSize: number;
    let originalName: string;

    // 处理不同类型的输入
    if (typeof sourceData === 'string') {
      // 如果是字符串，当作文件路径处理
      if (!existsSync(sourceData)) {
        return {
          success: false,
          error: '源文件不存在',
          errorCode: FileErrorCode.FILE_NOT_FOUND,
        };
      }

      const stats = statSync(sourceData);
      fileContent = await fs.readFile(sourceData);
      fileSize = stats.size;
      originalName = basename(sourceData);
    } else {
      // 如果是 Buffer，直接使用
      fileContent = sourceData;
      fileSize = fileContent.length;
      originalName = fileName;
    }

    const extension = extname(originalName);
    const uniqueFileName = generateUniqueFileName(originalName, options.noteId);

    // 创建目标目录结构
    const noteFilesPath = getNoteDirectoryPath(options.noteId);
    await ensureDirectoryExists(noteFilesPath);

    const targetPath = join(noteFilesPath, uniqueFileName);

    // 写入文件内容
    await fs.writeFile(targetPath, fileContent);

    // 创建文件信息
    const fileInfo: FileInfo = {
      id: uuidv4(),
      name: uniqueFileName,
      originalName,
      extension,
      size: fileSize,
      mimeType: getMimeType(extension),
      absolutePath: targetPath,
      noteId: options.noteId,
      fileType: options.fileType,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      description: options.description,
    };

    // 保存元数据
    await saveFileMetadata(fileInfo);

    return {
      success: true,
      fileInfo,
    };
  } catch (error) {
    console.error('文件上传失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      errorCode: FileErrorCode.UNKNOWN_ERROR,
    };
  }
};

/**
 * 软删除文件
 */
const deleteFile = async (
  fileId: string,
  noteId: string
): Promise<FileOperationResult> => {
  try {
    const fileInfo = await loadFileMetadata(noteId, fileId);

    if (!fileInfo) {
      return {
        success: false,
        error: '文件不存在',
        errorCode: FileErrorCode.FILE_NOT_FOUND,
      };
    }

    // 标记为已删除
    fileInfo.isDeleted = true;
    fileInfo.deletedAt = new Date();
    fileInfo.updatedAt = new Date();

    // 保存更新的元数据
    await saveFileMetadata(fileInfo);

    return {
      success: true,
      affectedCount: 1,
    };
  } catch (error) {
    console.error('文件删除失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      errorCode: FileErrorCode.UNKNOWN_ERROR,
    };
  }
};

/**
 * 永久删除文件
 */
const permanentDeleteFile = async (
  fileId: string,
  noteId: string
): Promise<FileOperationResult> => {
  try {
    const fileInfo = await loadFileMetadata(noteId, fileId);

    if (!fileInfo) {
      return {
        success: false,
        error: '文件不存在',
        errorCode: FileErrorCode.FILE_NOT_FOUND,
      };
    }

    // 删除实际文件
    if (existsSync(fileInfo.absolutePath)) {
      await fs.unlink(fileInfo.absolutePath);
    }

    // 删除元数据文件
    const metadataPath = getFileMetadataPath(noteId, fileId);
    if (existsSync(metadataPath)) {
      await fs.unlink(metadataPath);
    }

    return {
      success: true,
      affectedCount: 1,
    };
  } catch (error) {
    console.error('永久删除文件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      errorCode: FileErrorCode.UNKNOWN_ERROR,
    };
  }
};

/**
 * 恢复已删除的文件
 */
const restoreFile = async (
  fileId: string,
  noteId: string
): Promise<FileOperationResult> => {
  try {
    const fileInfo = await loadFileMetadata(noteId, fileId);

    if (!fileInfo) {
      return {
        success: false,
        error: '文件不存在',
        errorCode: FileErrorCode.FILE_NOT_FOUND,
      };
    }

    if (!fileInfo.isDeleted) {
      return {
        success: false,
        error: '文件未被删除',
        errorCode: FileErrorCode.UNKNOWN_ERROR,
      };
    }

    // 恢复文件
    fileInfo.isDeleted = false;
    fileInfo.deletedAt = undefined;
    fileInfo.updatedAt = new Date();

    // 保存更新的元数据
    await saveFileMetadata(fileInfo);

    return {
      success: true,
      affectedCount: 1,
    };
  } catch (error) {
    console.error('文件恢复失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      errorCode: FileErrorCode.UNKNOWN_ERROR,
    };
  }
};

/**
 * 获取文件信息
 */
const getFileInfo = async (
  fileId: string,
  noteId: string
): Promise<FileInfo | null> => {
  return await loadFileMetadata(noteId, fileId);
};

/**
 * 获取文件列表
 */
// const getFilesList = async (
//   filter: FileFilterOptions = {},
//   page = 1,
//   pageSize = 50
// ): Promise<FileSearchResult> => {
//   try {
//     let allFiles: FileInfo[] = [];

//     if (filter.noteId) {
//       // 获取指定笔记的文件
//       const noteFiles = await loadNoteFileMetadata(
//         filter.noteId,
//         filter.includeDeleted
//       );
//       allFiles = noteFiles;
//     } else {
//       // 获取所有笔记的文件
//       const filesPath = getFilesDataPath();
//       if (existsSync(filesPath)) {
//         const noteDirs = await fs.readdir(filesPath);

//         for (const noteId of noteDirs) {
//           const noteFilesPath = join(filesPath, noteId);
//           const stats = await fs.stat(noteFilesPath);

//           if (stats.isDirectory()) {
//             const noteFiles = await loadNoteFileMetadata(
//               noteId,
//               filter.includeDeleted
//             );
//             allFiles.push(...noteFiles);
//           }
//         }
//       }
//     }

//     // 应用筛选条件
//     let filteredFiles = allFiles;

//     if (filter.fileType) {
//       filteredFiles = filteredFiles.filter(
//         file => file.fileType === filter.fileType
//       );
//     }

//     if (filter.extensions && filter.extensions.length > 0) {
//       filteredFiles = filteredFiles.filter(file => {
//         const ext = extname(file.name).toLowerCase();
//         return filter.extensions!.includes(ext);
//       });
//     }

//     if (filter.sizeRange) {
//       filteredFiles = filteredFiles.filter(file => {
//         if (filter.sizeRange!.min && file.size < filter.sizeRange!.min)
//           return false;
//         if (filter.sizeRange!.max && file.size > filter.sizeRange!.max)
//           return false;
//         return true;
//       });
//     }

//     if (filter.dateRange) {
//       filteredFiles = filteredFiles.filter(file => {
//         const createdAt = file.createdAt;
//         if (filter.dateRange!.from && createdAt < filter.dateRange!.from)
//           return false;
//         if (filter.dateRange!.to && createdAt > filter.dateRange!.to)
//           return false;
//         return true;
//       });
//     }

//     // 分页
//     const startIndex = (page - 1) * pageSize;
//     const endIndex = startIndex + pageSize;
//     const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

//     return {
//       files: paginatedFiles,
//       total: filteredFiles.length,
//       page,
//       pageSize,
//     };
//   } catch (error) {
//     console.error('获取文件列表失败:', error);
//     return {
//       files: [],
//       total: 0,
//       page,
//       pageSize,
//     };
//   }
// };

/**
 * 获取文件统计信息
 */
const getFileStats = async (noteId: string): Promise<FileStats> => {
  try {
    let allFiles: FileInfo[] = [];

    allFiles = await loadNoteFileMetadata(noteId, false);

    const stats: FileStats = {
      totalCount: allFiles.length,
      totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
      byType: {} as Record<FileUsageType, { count: number; size: number }>,
      byExtension: {},
    };

    // 按类型统计
    for (const type of Object.values(FileUsageType)) {
      stats.byType[type] = { count: 0, size: 0 };
    }

    allFiles.forEach(file => {
      // 按类型
      if (!stats.byType[file.fileType]) {
        stats.byType[file.fileType] = { count: 0, size: 0 };
      }
      stats.byType[file.fileType].count++;
      stats.byType[file.fileType].size += file.size;

      // 按扩展名
      const ext = extname(file.name).toLowerCase();
      if (!stats.byExtension[ext]) {
        stats.byExtension[ext] = { count: 0, size: 0 };
      }
      stats.byExtension[ext].count++;
      stats.byExtension[ext].size += file.size;
    });

    return stats;
  } catch (error) {
    console.error('获取文件统计失败:', error);
    return {
      totalCount: 0,
      totalSize: 0,
      byType: {} as Record<FileUsageType, { count: number; size: number }>,
      byExtension: {},
    };
  }
};

/**
 * 批量删除笔记的所有文件
 */
const deleteNoteFiles = async (
  noteId: string
): Promise<FileOperationResult> => {
  try {
    const noteFiles = await loadNoteFileMetadata(noteId, true);

    let deletedCount = 0;
    for (const fileInfo of noteFiles) {
      if (!fileInfo.isDeleted) {
        fileInfo.isDeleted = true;
        fileInfo.deletedAt = new Date();
        fileInfo.updatedAt = new Date();
        await saveFileMetadata(fileInfo);
        deletedCount++;
      }
    }

    return {
      success: true,
      affectedCount: deletedCount,
    };
  } catch (error) {
    console.error('批量删除文件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      errorCode: FileErrorCode.UNKNOWN_ERROR,
    };
  }
};

/**
 * 永久删除笔记的所有文件
 */
const permanentDeleteNoteFiles = async (
  noteId: string
): Promise<FileOperationResult> => {
  try {
    const noteFilesPath = getNoteDirectoryPath(noteId);

    if (!existsSync(noteFilesPath)) {
      return {
        success: true,
        affectedCount: 0,
      };
    }

    const files = await fs.readdir(noteFilesPath);
    let deletedCount = 0;

    // 删除所有文件
    for (const file of files) {
      const filePath = join(noteFilesPath, file);
      await fs.unlink(filePath);
      deletedCount++;
    }

    // 删除目录
    await fs.rmdir(noteFilesPath);

    return {
      success: true,
      affectedCount: deletedCount,
    };
  } catch (error) {
    console.error('永久删除笔记文件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      errorCode: FileErrorCode.UNKNOWN_ERROR,
    };
  }
};

/**
 * 注册文件操作的IPC处理程序
 */
export function registerFileActionHandlers(): void {
  // 上传文件
  ipcMain.handle(
    'file:upload',
    async (
      event,
      sourcePath: string | Buffer,
      fileName: string,
      options: FileUploadOptions
    ) => {
      return await uploadFile(sourcePath, fileName, options);
    }
  );

  // 软删除文件
  ipcMain.handle(
    'file:delete',
    async (event, fileId: string, noteId: string) => {
      return await deleteFile(fileId, noteId);
    }
  );

  // 永久删除文件
  ipcMain.handle(
    'file:permanentDelete',
    async (event, fileId: string, noteId: string) => {
      return await permanentDeleteFile(fileId, noteId);
    }
  );

  // 恢复文件
  ipcMain.handle(
    'file:restore',
    async (event, fileId: string, noteId: string) => {
      return await restoreFile(fileId, noteId);
    }
  );

  // 获取文件信息
  ipcMain.handle(
    'file:getInfo',
    async (event, fileId: string, noteId: string) => {
      return await getFileInfo(fileId, noteId);
    }
  );

  // 获取文件列表
  ipcMain.handle(
    'file:getList',
    async (
      event,
      filter: FileFilterOptions,
      page: number,
      pageSize: number
    ) => {
      return await loadNoteFileMetadata(filter.noteId, filter.includeDeleted);
    }
  );

  // 获取文件统计
  ipcMain.handle('file:getStats', async (event, noteId?: string) => {
    return await getFileStats(noteId);
  });

  // 批量删除笔记文件
  ipcMain.handle('file:deleteNoteFiles', async (event, noteId: string) => {
    return await deleteNoteFiles(noteId);
  });

  // 永久删除笔记文件
  ipcMain.handle(
    'file:permanentDeleteNoteFiles',
    async (event, noteId: string) => {
      return await permanentDeleteNoteFiles(noteId);
    }
  );

  // 选择文件对话框
  ipcMain.handle(
    'file:selectFiles',
    async (event, options: Electron.OpenDialogOptions) => {
      const result = await dialog.showOpenDialog(options);
      return result;
    }
  );

  // 选择目录对话框
  ipcMain.handle(
    'file:selectDirectory',
    async (event, options: Electron.OpenDialogOptions) => {
      const result = await dialog.showOpenDialog({
        ...options,
        properties: ['openDirectory', 'createDirectory'],
      });
      return result;
    }
  );
}
