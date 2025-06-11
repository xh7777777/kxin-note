import { ipcMain, dialog } from 'electron';
import { promises as fs, existsSync, statSync } from 'fs';
import { join, dirname, extname, basename, relative } from 'path';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { app } from 'electron';

import {
  FileInfo,
  FileUploadOptions,
  FileUploadResult,
  FileFilterOptions,
  FileSearchResult,
  FileStats,
  FileOperationResult,
  FileUsageType,
  FileErrorCode,
  FileIndex,
  FileIndexItem,
} from '../../../customTypes/models/file.types';

/**
 * 获取文件存储根目录
 */
const getFilesDataPath = (): string => {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    const projectRoot = process.cwd();
    return join(projectRoot, 'assets', 'files');
  } else {
    const userDataPath = app.getPath('userData');
    return join(userDataPath, 'files');
  }
};

/**
 * 获取文件索引路径
 */
const getFilesIndexPath = (): string => {
  return join(getFilesDataPath(), 'files-index.json');
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
 * 生成文件哈希值
 */
const generateFileHash = async (filePath: string): Promise<string> => {
  const fileBuffer = await fs.readFile(filePath);
  const hash = createHash('md5');
  hash.update(fileBuffer);
  return hash.digest('hex');
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
 * 加载文件索引
 */
const loadFilesIndex = async (): Promise<FileIndex> => {
  const indexPath = getFilesIndexPath();

  try {
    if (!existsSync(indexPath)) {
      const newIndex: FileIndex = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        files: [],
      };
      await saveFilesIndex(newIndex);
      return newIndex;
    }

    const indexContent = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(indexContent);
  } catch (error) {
    console.error('加载文件索引失败:', error);
    throw new Error('Failed to load files index');
  }
};

/**
 * 保存文件索引
 */
const saveFilesIndex = async (index: FileIndex): Promise<void> => {
  const indexPath = getFilesIndexPath();
  await ensureDirectoryExists(dirname(indexPath));

  try {
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  } catch (error) {
    console.error('保存文件索引失败:', error);
    throw new Error('Failed to save files index');
  }
};

/**
 * 更新文件索引中的文件信息
 */
const updateFileInIndex = async (fileInfo: FileInfo): Promise<void> => {
  const index = await loadFilesIndex();

  const indexItem: FileIndexItem = {
    id: fileInfo.id,
    name: fileInfo.name,
    noteId: fileInfo.noteId,
    fileType: fileInfo.fileType,
    size: fileInfo.size,
    relativePath: fileInfo.relativePath,
    createdAt: fileInfo.createdAt.toISOString(),
    updatedAt: fileInfo.updatedAt.toISOString(),
    hash: fileInfo.hash,
  };

  const existingIndex = index.files.findIndex(item => item.id === fileInfo.id);
  if (existingIndex !== -1) {
    index.files[existingIndex] = indexItem;
  } else {
    index.files.push(indexItem);
  }

  index.lastUpdated = new Date().toISOString();
  await saveFilesIndex(index);
};

/**
 * 从索引中移除文件
 */
const removeFileFromIndex = async (fileId: string): Promise<void> => {
  const index = await loadFilesIndex();
  index.files = index.files.filter(item => item.id !== fileId);
  index.lastUpdated = new Date().toISOString();
  await saveFilesIndex(index);
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
 * 上传文件
 */
const uploadFile = async (
  sourcePath: string,
  options: FileUploadOptions
): Promise<FileUploadResult> => {
  try {
    // 检查源文件是否存在
    if (!existsSync(sourcePath)) {
      return {
        success: false,
        error: '源文件不存在',
        errorCode: FileErrorCode.FILE_NOT_FOUND,
      };
    }

    const stats = statSync(sourcePath);
    const originalName = basename(sourcePath);
    const extension = extname(sourcePath);
    const fileName = generateUniqueFileName(originalName, options.noteId);

    // 创建目标目录结构
    const filesPath = getFilesDataPath();
    const noteFilesPath = join(filesPath, options.noteId);
    await ensureDirectoryExists(noteFilesPath);

    const targetPath = join(noteFilesPath, fileName);
    const relativePath = relative(filesPath, targetPath);

    // 复制文件
    await fs.copyFile(sourcePath, targetPath);

    // 生成文件哈希
    const hash = await generateFileHash(targetPath);

    // 创建文件信息
    const fileInfo: FileInfo = {
      id: uuidv4(),
      name: fileName,
      originalName,
      extension,
      size: stats.size,
      mimeType: getMimeType(extension),
      relativePath,
      absolutePath: targetPath,
      noteId: options.noteId,
      fileType: options.fileType,
      createdAt: new Date(),
      updatedAt: new Date(),
      hash,
      description: options.description,
      tags: options.tags,
    };

    // 更新索引
    await updateFileInIndex(fileInfo);

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
 * 删除文件
 */
const deleteFile = async (fileId: string): Promise<FileOperationResult> => {
  try {
    const index = await loadFilesIndex();
    const fileItem = index.files.find(item => item.id === fileId);

    if (!fileItem) {
      return {
        success: false,
        error: '文件不存在',
        errorCode: FileErrorCode.FILE_NOT_FOUND,
      };
    }

    const filePath = join(getFilesDataPath(), fileItem.relativePath);

    // 删除文件
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
    }

    // 从索引中移除
    await removeFileFromIndex(fileId);

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
 * 获取文件信息
 */
const getFileInfo = async (fileId: string): Promise<FileInfo | null> => {
  try {
    const index = await loadFilesIndex();
    const fileItem = index.files.find(item => item.id === fileId);

    if (!fileItem) {
      return null;
    }

    const filePath = join(getFilesDataPath(), fileItem.relativePath);

    if (!existsSync(filePath)) {
      // 文件已不存在，从索引中移除
      await removeFileFromIndex(fileId);
      return null;
    }

    const fileInfo: FileInfo = {
      id: fileItem.id,
      name: fileItem.name,
      originalName: fileItem.name,
      extension: extname(fileItem.name),
      size: fileItem.size,
      mimeType: getMimeType(extname(fileItem.name)),
      relativePath: fileItem.relativePath,
      absolutePath: filePath,
      noteId: fileItem.noteId,
      fileType: fileItem.fileType,
      createdAt: new Date(fileItem.createdAt),
      updatedAt: new Date(fileItem.updatedAt),
      hash: fileItem.hash,
    };

    return fileInfo;
  } catch (error) {
    console.error('获取文件信息失败:', error);
    return null;
  }
};

/**
 * 获取文件列表
 */
const getFilesList = async (
  filter: FileFilterOptions = {},
  page = 1,
  pageSize = 50
): Promise<FileSearchResult> => {
  try {
    const index = await loadFilesIndex();
    let filteredFiles = [...index.files];

    // 应用筛选条件
    if (filter.noteId) {
      filteredFiles = filteredFiles.filter(
        file => file.noteId === filter.noteId
      );
    }

    if (filter.fileType) {
      filteredFiles = filteredFiles.filter(
        file => file.fileType === filter.fileType
      );
    }

    if (filter.extensions && filter.extensions.length > 0) {
      filteredFiles = filteredFiles.filter(file => {
        const ext = extname(file.name).toLowerCase();
        return filter.extensions!.includes(ext);
      });
    }

    if (filter.sizeRange) {
      filteredFiles = filteredFiles.filter(file => {
        if (filter.sizeRange!.min && file.size < filter.sizeRange!.min)
          return false;
        if (filter.sizeRange!.max && file.size > filter.sizeRange!.max)
          return false;
        return true;
      });
    }

    if (filter.dateRange) {
      filteredFiles = filteredFiles.filter(file => {
        const createdAt = new Date(file.createdAt);
        if (filter.dateRange!.from && createdAt < filter.dateRange!.from)
          return false;
        if (filter.dateRange!.to && createdAt > filter.dateRange!.to)
          return false;
        return true;
      });
    }

    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    // 转换为FileInfo格式
    const files: FileInfo[] = await Promise.all(
      paginatedFiles.map(async item => {
        const filePath = join(getFilesDataPath(), item.relativePath);
        return {
          id: item.id,
          name: item.name,
          originalName: item.name,
          extension: extname(item.name),
          size: item.size,
          mimeType: getMimeType(extname(item.name)),
          relativePath: item.relativePath,
          absolutePath: filePath,
          noteId: item.noteId,
          fileType: item.fileType,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          hash: item.hash,
        };
      })
    );

    return {
      files,
      total: filteredFiles.length,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('获取文件列表失败:', error);
    return {
      files: [],
      total: 0,
      page,
      pageSize,
    };
  }
};

/**
 * 获取文件统计信息
 */
const getFileStats = async (noteId?: string): Promise<FileStats> => {
  try {
    const index = await loadFilesIndex();
    let files = index.files;

    if (noteId) {
      files = files.filter(file => file.noteId === noteId);
    }

    const stats: FileStats = {
      totalCount: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      byType: {} as Record<FileUsageType, { count: number; size: number }>,
      byExtension: {},
    };

    // 按类型统计
    for (const type of Object.values(FileUsageType)) {
      stats.byType[type] = { count: 0, size: 0 };
    }

    files.forEach(file => {
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
    const index = await loadFilesIndex();
    const noteFiles = index.files.filter(file => file.noteId === noteId);

    let deletedCount = 0;
    for (const fileItem of noteFiles) {
      const filePath = join(getFilesDataPath(), fileItem.relativePath);

      if (existsSync(filePath)) {
        await fs.unlink(filePath);
      }

      await removeFileFromIndex(fileItem.id);
      deletedCount++;
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
 * 注册文件操作的IPC处理程序
 */
export function registerFileActionHandlers(): void {
  // 上传文件
  ipcMain.handle(
    'file:upload',
    async (event, sourcePath: string, options: FileUploadOptions) => {
      return await uploadFile(sourcePath, options);
    }
  );

  // 删除文件
  ipcMain.handle('file:delete', async (event, fileId: string) => {
    return await deleteFile(fileId);
  });

  // 获取文件信息
  ipcMain.handle('file:getInfo', async (event, fileId: string) => {
    return await getFileInfo(fileId);
  });

  // 获取文件列表
  ipcMain.handle(
    'file:getList',
    async (
      event,
      filter: FileFilterOptions,
      page: number,
      pageSize: number
    ) => {
      return await getFilesList(filter, page, pageSize);
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
