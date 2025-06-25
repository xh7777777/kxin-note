import { promises as fs } from 'fs';
import path from 'path';
import { app, ipcMain } from 'electron';
import type {
  INote,
  INoteMetadata,
  INoteStatus,
  INoteStats,
  INoteSearchIndex,
  NoteIndexEntry,
  NoteIndex,
} from '../../../customTypes/models/note.types';
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteAPIResponse,
} from '../../../customTypes/interface/noteApi.type.ts';
import { v4 as uuidv4 } from 'uuid';

/**
 * 笔记Hook返回接口
 */
export interface UseNoteRetrun {
  /**
   * 创建笔记
   */
  createNote: (request: CreateNoteRequest) => Promise<NoteAPIResponse<INote>>;

  /**
   * 根据ID获取笔记
   */
  getNoteById: (id: string) => Promise<NoteAPIResponse<INote>>;

  /**
   * 更新笔记
   */
  updateNote: (request: UpdateNoteRequest) => Promise<NoteAPIResponse<INote>>;

  /**
   * 获取笔记存储目录
   */
  getNotesDirectory: () => string;

  /**
   * 获取笔记列表
   */
  getNotesList: () => Promise<NoteAPIResponse<NoteIndexEntry[]>>;

  /**
   * 删除笔记
   */
  deleteNote: (id: string) => Promise<NoteAPIResponse<boolean>>;

  /**
   * 重建索引
   */
  rebuildIndex: () => Promise<NoteAPIResponse<boolean>>;
}

/**
 * 笔记文件存储Hook
 */
export function useNote(): UseNoteRetrun {
  // 笔记存储目录
  const getNotesDirectory = (): string => {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'kxin-notes');
  };

  // 索引文件路径
  const getIndexFilePath = (): string => {
    return path.join(getNotesDirectory(), 'note-index.json');
  };

  /**
   * 确保笔记目录存在
   */
  async function ensureNotesDirectory(): Promise<void> {
    const notesDir = getNotesDirectory();
    try {
      await fs.access(notesDir);
    } catch {
      await fs.mkdir(notesDir, { recursive: true });
    }
  }

  /**
   * 读取索引文件
   */
  async function readIndex(): Promise<NoteIndex> {
    const indexPath = getIndexFilePath();
    try {
      await ensureNotesDirectory();
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      return JSON.parse(indexContent);
    } catch (error) {
      // 如果索引文件不存在或损坏，返回空索引
      await rebuildIndex();
      return await readIndex();
    }
  }

  /**
   * 写入索引文件
   */
  async function writeIndex(index: NoteIndex): Promise<void> {
    const indexPath = getIndexFilePath();
    await ensureNotesDirectory();
    index.lastUpdated = new Date().toISOString();
    index.totalNotes = index.notes.length;
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  }

  /**
   * 创建索引条目
   */
  function createIndexEntry(note: INote, filePath: string): NoteIndexEntry {
    return {
      id: note.id,
      title: note.metadata.title,
      summary: note.metadata.summary,
      icon: note.metadata.icon,
      cover: note.metadata.cover,
      tags: note.metadata.tags || [],
      filePath,
      createdAt: note.metadata.createdAt,
      updatedAt: note.metadata.updatedAt,
      wordCount: note.metadata.wordCount || 0,
      status: {
        isFavorite: note.status.isFavorite,
        isArchived: note.status.isArchived,
        isDeleted: note.status.isDeleted,
        isPinned: note.status.isPinned,
        isTrashed: note.status.isTrashed,
      },
      searchIndex: note.searchIndex,
    };
  }

  /**
   * 更新索引中的笔记条目
   */
  async function updateNoteIndex(note: INote, filePath: string): Promise<void> {
    const index = await readIndex();
    const existingIndex = index.notes.findIndex(entry => entry.id === note.id);
    const newEntry = createIndexEntry(note, filePath);

    if (existingIndex >= 0) {
      // 更新现有条目
      index.notes[existingIndex] = newEntry;
    } else {
      // 添加新条目
      index.notes.push(newEntry);
    }

    await writeIndex(index);
  }

  /**
   * 从索引中删除笔记条目
   */
  async function removeNoteFromIndex(noteId: string): Promise<void> {
    const index = await readIndex();
    index.notes = index.notes.filter(entry => entry.id !== noteId);
    await writeIndex(index);
  }

  /**
   * 生成笔记文件名
   */
  function generateFileName(
    id: string,
    updateTime: string,
    title: string
  ): string {
    // 清理标题中的特殊字符，避免文件名问题
    const cleanTitle = title
      .replace(/[<>:"/\\|?*]/g, '_') // 替换Windows不允许的字符
      .replace(/\s+/g, '_') // 替换空格
      .substring(0, 50); // 限制长度

    const timestamp = new Date(updateTime).getTime();
    return `${id}_${timestamp}_${cleanTitle}.json`;
  }

  /**
   * 根据ID查找笔记文件
   */
  async function findNoteFile(id: string): Promise<string | null> {
    // 先从索引中查找
    const index = await readIndex();
    const indexEntry = index.notes.find(entry => entry.id === id);

    if (indexEntry && indexEntry.filePath) {
      // 检查文件是否存在
      try {
        await fs.access(indexEntry.filePath);
        return indexEntry.filePath;
      } catch {
        // 文件不存在，从索引中删除并继续查找
        await removeNoteFromIndex(id);
      }
    }

    // 如果索引中没有或文件不存在，则在目录中查找
    const notesDir = getNotesDirectory();
    try {
      const files = await fs.readdir(notesDir);
      const noteFile = files.find(
        file => file.startsWith(`${id}_`) && file.endsWith('.json')
      );
      return noteFile ? path.join(notesDir, noteFile) : null;
    } catch (error) {
      console.error('查找笔记文件失败:', error);
      return null;
    }
  }

  /**
   * 创建搜索索引
   */
  function createSearchIndex(note: INote): INoteSearchIndex {
    const { id, metadata } = note;
    const searchableText = [
      metadata.title,
      metadata.content,
      metadata.summary || '',
      ...(metadata.tags || []),
    ]
      .filter(Boolean)
      .join(' ');

    return {
      id,
      title: metadata.title,
      content: metadata.content,
      summary: metadata.summary,
      tags: metadata.tags,
      searchableText,
      titleWeight: 1.0,
      contentWeight: 0.8,
      tagsWeight: 0.9,
    };
  }

  /**
   * 创建默认统计信息
   */
  function createDefaultStats(): INoteStats {
    return {
      editCount: 0,
      relationCount: 0,
      childrenCount: 0,
    };
  }

  /**
   * 创建笔记
   */
  async function createNote(
    request: CreateNoteRequest
  ): Promise<NoteAPIResponse<INote>> {
    try {
      await ensureNotesDirectory();

      // 生成唯一ID
      const id = uuidv4();
      const now = new Date().toISOString();

      // 构建笔记元数据
      const metadata: INoteMetadata = {
        title: request.title || '无标题笔记',
        content: request.content || '',
        summary: request.summary,
        tags: request.tags || [],
        icon: request.icon || '',
        cover: request.cover || '',
        attachments: request.attachments || [],
        createdAt: now,
        updatedAt: now,
        version: 1,
        language: request.language || 'zh-CN',
        wordCount: (request.content || '').length,
        readingTime: Math.ceil((request.content || '').length / 200), // 假设每分钟200字
      };

      // 构建笔记状态
      const status: INoteStatus = {
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        isPinned: false,
        isTrashed: false,
        isReadOnly: false,
        isStar: false,
      };

      // 构建完整笔记对象
      const note: INote = {
        id,
        metadata,
        status,
        stats: createDefaultStats(),
        relatedNoteIds: request.relatedNoteIds || [],
        searchIndex: {} as INoteSearchIndex, // 临时占位
      };

      // 创建搜索索引
      note.searchIndex = createSearchIndex(note);

      // 生成文件名并保存
      const fileName = generateFileName(id, metadata.updatedAt, metadata.title);
      const filePath = path.join(getNotesDirectory(), fileName);

      await fs.writeFile(filePath, JSON.stringify(note, null, 2), 'utf-8');

      // 更新索引
      await updateNoteIndex(note, filePath);

      return {
        success: true,
        data: note,
        message: '笔记创建成功',
        timestamp: now,
      };
    } catch (error) {
      console.error('创建笔记失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建笔记失败',
        message: '创建笔记时发生错误',
      };
    }
  }

  /**
   * 根据ID获取笔记
   */
  async function getNoteById(id: string): Promise<NoteAPIResponse<INote>> {
    try {
      const filePath = await findNoteFile(id);

      if (!filePath) {
        return {
          success: false,
          error: '笔记不存在',
          message: `未找到ID为 ${id} 的笔记`,
        };
      }

      const fileContent = await fs.readFile(filePath, 'utf-8');
      const note: INote = JSON.parse(fileContent);

      // 更新最后查看时间
      if (
        note.metadata.lastViewedAt !== new Date().toISOString().split('T')[0]
      ) {
        note.metadata.lastViewedAt = new Date().toISOString();
        note.stats.editCount += 1;

        // 更新文件
        await fs.writeFile(filePath, JSON.stringify(note, null, 2), 'utf-8');

        // 更新索引
        await updateNoteIndex(note, filePath);
      }

      return {
        success: true,
        data: note,
        message: '获取笔记成功',
      };
    } catch (error) {
      console.error('获取笔记失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取笔记失败',
        message: '获取笔记时发生错误',
      };
    }
  }

  /**
   * 更新笔记
   */
  async function updateNote(
    request: UpdateNoteRequest
  ): Promise<NoteAPIResponse<INote>> {
    try {
      const oldFilePath = await findNoteFile(request.id);

      if (!oldFilePath) {
        return {
          success: false,
          error: '笔记不存在',
          message: `未找到ID为 ${request.id} 的笔记`,
        };
      }

      // 读取现有笔记
      const fileContent = await fs.readFile(oldFilePath, 'utf-8');
      const note: INote = JSON.parse(fileContent);

      // 更新元数据
      if (request.metadata) {
        Object.assign(note.metadata, request.metadata);
        note.metadata.updatedAt = new Date().toISOString();
        note.metadata.version += 1;

        // 重新计算字数和阅读时间
        if (request.metadata.content !== undefined) {
          note.metadata.wordCount = request.metadata.content.length;
          note.metadata.readingTime = Math.ceil(
            request.metadata.content.length / 200
          );
        }
      }

      // 更新状态
      if (request.status) {
        Object.assign(note.status, request.status);
      }

      // 更新统计信息
      note.stats.editCount += 1;

      // 更新搜索索引
      if (request.updateSearchIndex !== false) {
        note.searchIndex = createSearchIndex(note);
      }

      // 生成新文件名（因为更新时间变了）
      const newFileName = generateFileName(
        note.id,
        note.metadata.updatedAt,
        note.metadata.title
      );
      const newFilePath = path.join(getNotesDirectory(), newFileName);

      // 如果文件名发生变化，删除旧文件
      if (oldFilePath !== newFilePath) {
        await fs.unlink(oldFilePath);
      }

      // 保存更新后的笔记
      await fs.writeFile(newFilePath, JSON.stringify(note, null, 2), 'utf-8');

      // 更新索引
      await updateNoteIndex(note, newFilePath);

      return {
        success: true,
        data: note,
        message: '笔记更新成功',
        timestamp: note.metadata.updatedAt,
      };
    } catch (error) {
      console.error('更新笔记失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新笔记失败',
        message: '更新笔记时发生错误',
      };
    }
  }

  /**
   * 删除笔记
   */
  async function deleteNote(id: string): Promise<NoteAPIResponse<boolean>> {
    try {
      const filePath = await findNoteFile(id);

      if (!filePath) {
        return {
          success: false,
          error: '笔记不存在',
          message: `未找到ID为 ${id} 的笔记`,
        };
      }

      // 删除文件
      await fs.unlink(filePath);

      // 从索引中删除
      await removeNoteFromIndex(id);

      return {
        success: true,
        data: true,
        message: '笔记删除成功',
      };
    } catch (error) {
      console.error('删除笔记失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除笔记失败',
        message: '删除笔记时发生错误',
      };
    }
  }

  /**
   * 获取笔记列表
   */
  async function getNotesList(): Promise<NoteAPIResponse<NoteIndexEntry[]>> {
    try {
      const index = await readIndex();
      return {
        success: true,
        data: index.notes,
        message: `成功获取 ${index.totalNotes} 篇笔记`,
      };
    } catch (error) {
      console.error('获取笔记列表失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取笔记列表失败',
        message: '获取笔记列表时发生错误',
      };
    }
  }

  /**
   * 重建索引
   */
  async function rebuildIndex(): Promise<NoteAPIResponse<boolean>> {
    try {
      const notesDir = getNotesDirectory();
      const files = await fs.readdir(notesDir);
      const newIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalNotes: 0,
        notes: [],
      };

      // 扫描所有笔记文件
      for (const file of files) {
        if (file.endsWith('.json') && file !== 'note-index.json') {
          try {
            const filePath = path.join(notesDir, file);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const note: INote = JSON.parse(fileContent);

            // 创建索引条目
            const indexEntry = createIndexEntry(note, filePath);
            newIndex.notes.push(indexEntry);
          } catch (error) {
            console.warn(`跳过损坏的笔记文件: ${file}`, error);
          }
        }
      }

      // 写入新索引
      await writeIndex(newIndex);

      return {
        success: true,
        data: true,
        message: `索引重建成功，共处理 ${newIndex.notes.length} 篇笔记`,
      };
    } catch (error) {
      console.error('重建索引失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '重建索引失败',
        message: '重建索引时发生错误',
      };
    }
  }

  return {
    createNote,
    getNoteById,
    updateNote,
    getNotesDirectory,
    getNotesList,
    deleteNote,
    rebuildIndex,
  };
}

export function registerNoteActionHandlers() {
  const {
    createNote,
    getNoteById,
    updateNote,
    getNotesDirectory,
    getNotesList,
    deleteNote,
    rebuildIndex,
  } = useNote();

  ipcMain.handle('createNote', async (event, request: CreateNoteRequest) => {
    return await createNote(request);
  });
  ipcMain.handle('getNoteById', async (event, id: string) => {
    return await getNoteById(id);
  });
  ipcMain.handle('updateNote', async (event, request: UpdateNoteRequest) => {
    return await updateNote(request);
  });
  ipcMain.handle('getNotesDirectory', async (event: any) => {
    return getNotesDirectory();
  });
  ipcMain.handle('getNotesList', async (event: any) => {
    return await getNotesList();
  });
  ipcMain.handle('deleteNote', async (event, id: string) => {
    return await deleteNote(id);
  });
  ipcMain.handle('rebuildIndex', async (event: any) => {
    return await rebuildIndex();
  });
}
