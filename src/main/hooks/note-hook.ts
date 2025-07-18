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
import { JSONFilePreset } from 'lowdb/node';

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
   * 根据筛选条件获取笔记列表
   */
  getNotesListByFilter: (
    filter: NoteFilter
  ) => Promise<NoteAPIResponse<NoteIndexEntry[]>>;

  /**
   * 将笔记移至垃圾桶（软删除）
   */
  moveToTrash: (id: string) => Promise<NoteAPIResponse<INote>>;

  /**
   * 从垃圾桶恢复笔记
   */
  restoreFromTrash: (id: string) => Promise<NoteAPIResponse<INote>>;

  /**
   * 永久删除笔记
   */
  permanentlyDeleteNote: (id: string) => Promise<NoteAPIResponse<boolean>>;

  /**
   * 重建索引
   */
  rebuildIndex: () => Promise<NoteAPIResponse<boolean>>;
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
 * lowdb 数据库类型定义
 */
interface IndexDatabase extends NoteIndex {}

interface NotesDatabase {
  notes: Record<string, INote>;
}

/**
 * 笔记存储目录
 */
function getNotesDirectory(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'kxin-notes');
}

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
 * 初始化数据库
 */
async function initializeDatabases(): Promise<{
  indexDb: Awaited<ReturnType<typeof JSONFilePreset<IndexDatabase>>>;
  notesDb: Awaited<ReturnType<typeof JSONFilePreset<NotesDatabase>>>;
}> {
  // 确保笔记目录存在
  await ensureNotesDirectory();

  // 初始化索引数据库
  const indexPath = path.join(getNotesDirectory(), 'note-index.json');
  const indexDb = await JSONFilePreset<IndexDatabase>(indexPath, {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalNotes: 0,
    notes: [],
  });

  // 初始化笔记数据库
  const notesPath = path.join(getNotesDirectory(), 'notes.json');
  const notesDb = await JSONFilePreset<NotesDatabase>(notesPath, {
    notes: {},
  });

  return { indexDb, notesDb };
}

// 数据库实例缓存
let dbInstances: Promise<{
  indexDb: Awaited<ReturnType<typeof JSONFilePreset<IndexDatabase>>>;
  notesDb: Awaited<ReturnType<typeof JSONFilePreset<NotesDatabase>>>;
}> | null = null;

/**
 * 获取数据库实例
 */
async function getDatabaseInstances() {
  if (!dbInstances) {
    dbInstances = initializeDatabases();
  }
  return await dbInstances;
}

/**
 * 笔记文件存储Hook
 */
export function useNote(): UseNoteRetrun {
  /**
   * 读取索引
   */
  async function readIndex(): Promise<NoteIndex> {
    const { indexDb } = await getDatabaseInstances();
    await indexDb.read();
    return indexDb.data;
  }

  /**
   * 写入索引
   */
  async function writeIndex(index: NoteIndex): Promise<void> {
    const { indexDb } = await getDatabaseInstances();
    index.lastUpdated = new Date().toISOString();
    index.totalNotes = index.notes.length;
    indexDb.data = index;
    await indexDb.write();
  }

  /**
   * 创建索引条目
   */
  function createIndexEntry(note: INote): NoteIndexEntry {
    return {
      id: note.id,
      title: note.metadata.title,
      summary: note.metadata.summary,
      icon: note.metadata.icon,
      cover: note.metadata.cover,
      tags: note.metadata.tags || [],
      filePath: '', // lowdb 中不需要文件路径
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
  async function updateNoteIndex(note: INote): Promise<void> {
    const index = await readIndex();
    const existingIndex = index.notes.findIndex(entry => entry.id === note.id);
    const newEntry = createIndexEntry(note);

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
   * 从数据库中读取笔记
   */
  async function readNoteFromDb(id: string): Promise<INote | null> {
    const { notesDb } = await getDatabaseInstances();
    await notesDb.read();
    return notesDb.data.notes[id] || null;
  }

  /**
   * 将笔记写入数据库
   */
  async function writeNoteToDb(note: INote): Promise<void> {
    const { notesDb } = await getDatabaseInstances();
    notesDb.data.notes[note.id] = note;
    await notesDb.write();
  }

  /**
   * 从数据库中删除笔记
   */
  async function deleteNoteFromDb(id: string): Promise<void> {
    const { notesDb } = await getDatabaseInstances();
    delete notesDb.data.notes[id];
    await notesDb.write();
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
      // 生成唯一ID
      const id = uuidv4();
      const now = new Date().toISOString();

      // 构建笔记元数据
      const metadata: INoteMetadata = {
        title: request.title || 'untitled',
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

      // 保存到数据库
      await writeNoteToDb(note);

      // 更新索引
      await updateNoteIndex(note);

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
      const note = await readNoteFromDb(id);

      if (!note) {
        return {
          success: false,
          error: '笔记不存在',
          message: `未找到ID为 ${id} 的笔记`,
        };
      }

      // 更新最后查看时间
      if (
        note.metadata.lastViewedAt !== new Date().toISOString().split('T')[0]
      ) {
        note.metadata.lastViewedAt = new Date().toISOString();
        note.stats.editCount += 1;

        // 更新数据库
        await writeNoteToDb(note);

        // 更新索引
        await updateNoteIndex(note);
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
      const note = await readNoteFromDb(request.id);

      if (!note) {
        return {
          success: false,
          error: '笔记不存在',
          message: `未找到ID为 ${request.id} 的笔记`,
        };
      }

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

      // 保存到数据库
      await writeNoteToDb(note);

      // 更新索引
      await updateNoteIndex(note);

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
   * 根据筛选条件获取笔记列表
   */
  async function getNotesListByFilter(
    filter: NoteFilter
  ): Promise<NoteAPIResponse<NoteIndexEntry[]>> {
    try {
      const index = await readIndex();
      let filteredNotes = [...index.notes];

      // 应用筛选条件
      if (filter.isTrashed !== undefined) {
        filteredNotes = filteredNotes.filter(
          note => note.status.isTrashed === filter.isTrashed
        );
      }

      if (filter.isFavorite !== undefined) {
        filteredNotes = filteredNotes.filter(
          note => note.status.isFavorite === filter.isFavorite
        );
      }

      if (filter.isArchived !== undefined) {
        filteredNotes = filteredNotes.filter(
          note => note.status.isArchived === filter.isArchived
        );
      }

      if (filter.isPinned !== undefined) {
        filteredNotes = filteredNotes.filter(
          note => note.status.isPinned === filter.isPinned
        );
      }

      if (filter.tags && filter.tags.length > 0) {
        filteredNotes = filteredNotes.filter(note =>
          filter.tags!.some(tag => note.tags.includes(tag))
        );
      }

      if (filter.searchKeyword) {
        const keyword = filter.searchKeyword.toLowerCase();
        filteredNotes = filteredNotes.filter(
          note =>
            note.title.toLowerCase().includes(keyword) ||
            note.summary?.toLowerCase().includes(keyword) ||
            note.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      }

      if (filter.createdAfter) {
        filteredNotes = filteredNotes.filter(
          note => new Date(note.createdAt) >= new Date(filter.createdAfter!)
        );
      }

      if (filter.createdBefore) {
        filteredNotes = filteredNotes.filter(
          note => new Date(note.createdAt) <= new Date(filter.createdBefore!)
        );
      }

      if (filter.updatedAfter) {
        filteredNotes = filteredNotes.filter(
          note => new Date(note.updatedAt) >= new Date(filter.updatedAfter!)
        );
      }

      if (filter.updatedBefore) {
        filteredNotes = filteredNotes.filter(
          note => new Date(note.updatedAt) <= new Date(filter.updatedBefore!)
        );
      }

      return {
        success: true,
        data: filteredNotes,
        message: `成功获取 ${filteredNotes.length} 篇笔记`,
      };
    } catch (error) {
      console.error('获取筛选笔记列表失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取筛选笔记列表失败',
        message: '获取筛选笔记列表时发生错误',
      };
    }
  }

  /**
   * 将笔记移至垃圾桶（软删除）
   */
  async function moveToTrash(id: string): Promise<NoteAPIResponse<INote>> {
    try {
      const note = await readNoteFromDb(id);

      if (!note) {
        return {
          success: false,
          error: '笔记不存在',
          message: `未找到ID为 ${id} 的笔记`,
        };
      }

      // 更新状态为已删除
      note.status.isTrashed = true;
      note.metadata.updatedAt = new Date().toISOString();
      note.metadata.version += 1;

      // 保存到数据库
      await writeNoteToDb(note);

      // 更新索引
      await updateNoteIndex(note);

      return {
        success: true,
        data: note,
        message: '笔记已移至垃圾桶',
        timestamp: note.metadata.updatedAt,
      };
    } catch (error) {
      console.error('移动笔记到垃圾桶失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '移动笔记到垃圾桶失败',
        message: '移动笔记到垃圾桶时发生错误',
      };
    }
  }

  /**
   * 从垃圾桶恢复笔记
   */
  async function restoreFromTrash(id: string): Promise<NoteAPIResponse<INote>> {
    try {
      const note = await readNoteFromDb(id);

      if (!note) {
        return {
          success: false,
          error: '笔记不存在',
          message: `未找到ID为 ${id} 的笔记`,
        };
      }

      // 检查是否在垃圾桶中
      if (!note.status.isTrashed) {
        return {
          success: false,
          error: '笔记不在垃圾桶中',
          message: '该笔记未被删除，无需恢复',
        };
      }

      // 恢复笔记状态
      note.status.isTrashed = false;
      note.metadata.updatedAt = new Date().toISOString();
      note.metadata.version += 1;

      // 保存到数据库
      await writeNoteToDb(note);

      // 更新索引
      await updateNoteIndex(note);

      return {
        success: true,
        data: note,
        message: '笔记已从垃圾桶恢复',
        timestamp: note.metadata.updatedAt,
      };
    } catch (error) {
      console.error('从垃圾桶恢复笔记失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '从垃圾桶恢复笔记失败',
        message: '从垃圾桶恢复笔记时发生错误',
      };
    }
  }

  /**
   * 永久删除笔记
   */
  async function permanentlyDeleteNote(
    id: string
  ): Promise<NoteAPIResponse<boolean>> {
    try {
      const note = await readNoteFromDb(id);

      if (!note) {
        return {
          success: false,
          error: '笔记不存在',
          message: `未找到ID为 ${id} 的笔记`,
        };
      }

      if (!note.status.isTrashed) {
        return {
          success: false,
          error: '笔记未在垃圾桶中',
          message: '只能永久删除垃圾桶中的笔记',
        };
      }

      // 从数据库中删除
      await deleteNoteFromDb(id);

      // 从索引中删除
      await removeNoteFromIndex(id);

      return {
        success: true,
        data: true,
        message: '笔记已永久删除',
      };
    } catch (error) {
      console.error('永久删除笔记失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '永久删除笔记失败',
        message: '永久删除笔记时发生错误',
      };
    }
  }

  /**
   * 获取笔记列表
   */
  async function getNotesList(
    filterTrashed = true
  ): Promise<NoteAPIResponse<NoteIndexEntry[]>> {
    try {
      const index = await readIndex();
      if (filterTrashed) {
        index.notes = index.notes.filter(note => !note.status.isTrashed);
      }
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
      const { notesDb } = await getDatabaseInstances();
      await notesDb.read();

      const newIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalNotes: 0,
        notes: [],
      };

      // 扫描所有笔记
      const allNotes = notesDb.data.notes;
      for (const [noteId, note] of Object.entries(allNotes)) {
        try {
          // 创建索引条目
          const indexEntry = createIndexEntry(note as INote);
          newIndex.notes.push(indexEntry);
        } catch (error) {
          console.warn(`跳过损坏的笔记: ${noteId}`, error);
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
    getNotesListByFilter,
    moveToTrash,
    restoreFromTrash,
    permanentlyDeleteNote,
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
    getNotesListByFilter,
    moveToTrash,
    restoreFromTrash,
    permanentlyDeleteNote,
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
  ipcMain.handle('getNotesListByFilter', async (event, filter: NoteFilter) => {
    return await getNotesListByFilter(filter);
  });
  ipcMain.handle('moveToTrash', async (event, id: string) => {
    return await moveToTrash(id);
  });
  ipcMain.handle('restoreFromTrash', async (event, id: string) => {
    return await restoreFromTrash(id);
  });
  ipcMain.handle('permanentlyDeleteNote', async (event, id: string) => {
    return await permanentlyDeleteNote(id);
  });
  ipcMain.handle('rebuildIndex', async (event: any) => {
    return await rebuildIndex();
  });
}
