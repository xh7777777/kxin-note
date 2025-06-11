import { ipcMain } from 'electron';
import { promises as fs } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import {
  NotePage,
  NoteContent,
  PageMetadata,
  PageStatus,
  BlockType,
  NoteIndexItem,
  NoteIndex,
} from '../../../customTypes/models/note.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 笔记索引条目接口
 */

/**
 * 获取项目根目录
 */
const getProjectRoot = () => {
  return app.isPackaged
    ? join(app.getAppPath(), '..', '..')
    : join(__dirname, '..', '..', '..');
};

/**
 * 笔记数据存储路径
 */
const getNotesDataPath = () => {
  // if (app.isPackaged) {
  // 生产模式：使用用户数据目录
  const userDataPath = app.getPath('userData');
  return join(userDataPath, 'notes');
  // } else {
  //   // 开发模式：使用项目的assets目录
  //   const projectRoot = getProjectRoot();
  //   return join(projectRoot, 'assets', 'notes');
  // }
};

/**
 * 获取笔记索引文件路径
 */
const getNotesIndexPath = () => {
  return join(getNotesDataPath(), 'notes-index.json');
};

/**
 * 确保目录存在
 */
const ensureDirectoryExists = async (dirPath: string) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * 生成唯一ID
 */
const generateUniqueId = (): string => {
  return uuidv4();
};

/**
 * 加载笔记索引
 */
const loadNotesIndex = async (): Promise<NoteIndex> => {
  const indexPath = getNotesIndexPath();

  try {
    const data = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 如果索引文件不存在，创建一个新的
    const newIndex: NoteIndex = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      notes: [],
    };
    await saveNotesIndex(newIndex);
    return newIndex;
  }
};

/**
 * 保存笔记索引
 */
const saveNotesIndex = async (index: NoteIndex): Promise<void> => {
  const indexPath = getNotesIndexPath();
  index.lastUpdated = new Date().toISOString();
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
};

/**
 * 更新笔记索引中的条目
 */
const updateNoteInIndex = async (note: NotePage): Promise<void> => {
  const index = await loadNotesIndex();
  const filePath = join(getNotesDataPath(), `${note.id}.json`);

  const indexItem: NoteIndexItem = {
    id: note.id,
    title: note.title,
    icon: note.icon,
    filePath,
    updatedAt: note.metadata.updatedAt.toISOString(),
    createdAt: note.metadata.createdAt.toISOString(),
    parentId: note.parentId,
    level: note.level,
    isFavorite: note.isFavorite,
    isArchived: note.isArchived,
  };

  // 查找是否已存在
  const existingIndex = index.notes.findIndex(item => item.id === note.id);

  if (existingIndex >= 0) {
    // 更新现有条目
    index.notes[existingIndex] = indexItem;
  } else {
    // 添加新条目
    index.notes.push(indexItem);
  }

  // 按更新时间倒序排列
  index.notes.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  await saveNotesIndex(index);
};

/**
 * 从索引中删除笔记条目
 */
const removeNoteFromIndex = async (noteId: string): Promise<void> => {
  const index = await loadNotesIndex();
  index.notes = index.notes.filter(item => item.id !== noteId);
  await saveNotesIndex(index);
};

/**
 * 重建笔记索引
 */
const rebuildNotesIndex = async (): Promise<void> => {
  const notesPath = getNotesDataPath();
  await ensureDirectoryExists(notesPath);

  const files = await fs.readdir(notesPath);
  const notes: NoteIndexItem[] = [];

  for (const file of files) {
    if (file.endsWith('.json') && file !== 'notes-index.json') {
      try {
        const filePath = join(notesPath, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const note = JSON.parse(data);

        notes.push({
          id: note.id,
          title: note.title,
          icon: note.icon,
          filePath,
          updatedAt: note.metadata.updatedAt,
          createdAt: note.metadata.createdAt,
          parentId: note.parentId,
          level: note.level,
          isFavorite: note.isFavorite,
          isArchived: note.isArchived,
        });
      } catch (error) {
        console.error(`Failed to process note file ${file}:`, error);
      }
    }
  }

  // 按更新时间倒序排列
  notes.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const index: NoteIndex = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    notes,
  };

  await saveNotesIndex(index);
  console.log(`Rebuilt notes index with ${notes.length} notes`);
};

/**
 * 创建默认笔记内容
 */
const createDefaultNoteContent = (): NoteContent => {
  return {
    time: Date.now(),
    version: '2.30.8',
    blocks: [],
    stats: {
      characters: 0,
      words: 0,
      paragraphs: 0,
      readingTime: 0,
      blockCount: 0,
      imageCount: 0,
    },
  };
};

/**
 * 创建新笔记
 */
const createNewNote = async (
  title: string = '',
  parentId?: string
): Promise<NotePage> => {
  const noteId = generateUniqueId();
  const now = new Date();

  // 如果有父页面，计算层级
  let level = 0;
  if (parentId) {
    try {
      const parentNote = await loadNoteById(parentId);
      level = parentNote.level + 1;
    } catch (error) {
      console.warn('Failed to load parent note:', error);
    }
  }

  const metadata: PageMetadata = {
    createdAt: now,
    updatedAt: now,
    status: PageStatus.NORMAL,
  };

  const newNote: NotePage = {
    id: noteId,
    title,
    icon: '📝',
    parentId,
    level,
    content: createDefaultNoteContent(),
    metadata,
    tags: [],
    isExpanded: false,
    isFavorite: false,
    isArchived: false,
    order: Date.now(),
  };

  // 保存笔记到文件系统
  await saveNoteToFile(newNote);

  // 更新索引
  await updateNoteInIndex(newNote);

  return newNote;
};

/**
 * 保存笔记到文件
 */
const saveNoteToFile = async (note: NotePage): Promise<void> => {
  const notesPath = getNotesDataPath();
  await ensureDirectoryExists(notesPath);

  const filePath = join(notesPath, `${note.id}.json`);

  const noteData = {
    ...note,
    metadata: {
      ...note.metadata,
      createdAt: note.metadata.createdAt.toISOString(),
      updatedAt: note.metadata.updatedAt.toISOString(),
    },
  };

  await fs.writeFile(filePath, JSON.stringify(noteData, null, 2), 'utf-8');
};

/**
 * 根据ID加载笔记
 */
const loadNoteById = async (noteId: string): Promise<NotePage> => {
  const notesPath = getNotesDataPath();
  const filePath = join(notesPath, `${noteId}.json`);

  try {
    const noteData = await fs.readFile(filePath, 'utf-8');
    const note = JSON.parse(noteData);

    // 转换日期字符串回 Date 对象
    note.metadata.createdAt = new Date(note.metadata.createdAt);
    note.metadata.updatedAt = new Date(note.metadata.updatedAt);

    return note;
  } catch (error) {
    throw new Error(`Note not found: ${noteId}`);
  }
};

/**
 * 获取所有笔记（从索引中读取）
 */
const getAllNotes = async (): Promise<NoteIndexItem[]> => {
  try {
    const index = await loadNotesIndex();
    return index.notes.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (error) {
    console.error('Failed to load notes from index:', error);
    return [];
  }
};

/**
 * 根据字段更新笔记
 */
const updateNoteFields = async (
  noteId: string,
  updates: Partial<NotePage>
): Promise<NotePage> => {
  try {
    // 加载现有笔记
    const existingNote = await loadNoteById(noteId);

    // 创建更新后的笔记对象
    const updatedNote: NotePage = {
      ...existingNote,
      ...updates,
      id: noteId, // 确保ID不会被更改
      metadata: {
        ...existingNote.metadata,
        ...updates.metadata,
        updatedAt: new Date(), // 总是更新修改时间
        createdAt: existingNote.metadata.createdAt, // 保持创建时间不变
      },
    };

    // 如果更新了父页面ID，重新计算层级
    if (updates.parentId !== undefined) {
      if (updates.parentId) {
        try {
          const parentNote = await loadNoteById(updates.parentId);
          updatedNote.level = parentNote.level + 1;
        } catch (error) {
          console.warn(
            'Failed to load parent note for level calculation:',
            error
          );
          updatedNote.level = 0;
        }
      } else {
        updatedNote.level = 0;
      }
    }

    // 保存到文件
    await saveNoteToFile(updatedNote);

    // 更新索引
    await updateNoteInIndex(updatedNote);

    return updatedNote;
  } catch (error) {
    throw new Error(`Failed to update note ${noteId}: ${error.message}`);
  }
};

/**
 * 删除笔记
 */
const deleteNote = async (noteId: string): Promise<void> => {
  try {
    const notesPath = getNotesDataPath();
    const filePath = join(notesPath, `${noteId}.json`);

    // 删除文件
    await fs.unlink(filePath);

    // 从索引中移除
    await removeNoteFromIndex(noteId);

    console.log(`Note ${noteId} deleted successfully`);
  } catch (error) {
    throw new Error(`Failed to delete note ${noteId}: ${error.message}`);
  }
};

/**
 * 移动笔记到垃圾桶
 */
const moveNoteToTrash = async (noteId: string): Promise<NotePage> => {
  try {
    // 先加载现有笔记以获取完整的metadata
    const existingNote = await loadNoteById(noteId);

    const updatedNote = await updateNoteFields(noteId, {
      isInTrash: true,
      metadata: {
        ...existingNote.metadata,
        status: PageStatus.DELETED,
        updatedAt: new Date(),
      },
    });

    console.log(`Note ${noteId} moved to trash`);
    return updatedNote;
  } catch (error) {
    throw new Error(`Failed to move note ${noteId} to trash: ${error.message}`);
  }
};

/**
 * 从垃圾桶恢复笔记
 */
const restoreNoteFromTrash = async (noteId: string): Promise<NotePage> => {
  try {
    // 先加载现有笔记以获取完整的metadata
    const existingNote = await loadNoteById(noteId);

    const updatedNote = await updateNoteFields(noteId, {
      isInTrash: false,
      metadata: {
        ...existingNote.metadata,
        status: PageStatus.NORMAL,
        updatedAt: new Date(),
      },
    });

    console.log(`Note ${noteId} restored from trash`);
    return updatedNote;
  } catch (error) {
    throw new Error(
      `Failed to restore note ${noteId} from trash: ${error.message}`
    );
  }
};

/**
 * 归档笔记
 */
const archiveNote = async (noteId: string): Promise<NotePage> => {
  try {
    // 先加载现有笔记以获取完整的metadata
    const existingNote = await loadNoteById(noteId);

    const updatedNote = await updateNoteFields(noteId, {
      isArchived: true,
      metadata: {
        ...existingNote.metadata,
        status: PageStatus.ARCHIVED,
        updatedAt: new Date(),
      },
    });

    console.log(`Note ${noteId} archived`);
    return updatedNote;
  } catch (error) {
    throw new Error(`Failed to archive note ${noteId}: ${error.message}`);
  }
};

/**
 * 取消归档笔记
 */
const unarchiveNote = async (noteId: string): Promise<NotePage> => {
  try {
    // 先加载现有笔记以获取完整的metadata
    const existingNote = await loadNoteById(noteId);

    const updatedNote = await updateNoteFields(noteId, {
      isArchived: false,
      metadata: {
        ...existingNote.metadata,
        status: PageStatus.NORMAL,
        updatedAt: new Date(),
      },
    });

    console.log(`Note ${noteId} unarchived`);
    return updatedNote;
  } catch (error) {
    throw new Error(`Failed to unarchive note ${noteId}: ${error.message}`);
  }
};

/**
 * 切换笔记收藏状态
 */
const toggleNoteFavorite = async (noteId: string): Promise<NotePage> => {
  try {
    // 先加载当前笔记以获取当前收藏状态
    const currentNote = await loadNoteById(noteId);
    const newFavoriteStatus = !currentNote.isFavorite;

    const updatedNote = await updateNoteFields(noteId, {
      isFavorite: newFavoriteStatus,
    });

    console.log(
      `Note ${noteId} favorite status changed to: ${newFavoriteStatus}`
    );
    return updatedNote;
  } catch (error) {
    throw new Error(
      `Failed to toggle favorite for note ${noteId}: ${error.message}`
    );
  }
};

/**
 * 初始化存储目录
 */
const initializeStorageDirectories = async () => {
  try {
    const notesPath = getNotesDataPath();

    await ensureDirectoryExists(notesPath);

    // 检查是否需要重建索引
    const indexPath = getNotesIndexPath();
    try {
      await fs.access(indexPath);
      console.log('Notes index found');
    } catch {
      console.log('Notes index not found, rebuilding...');
      await rebuildNotesIndex();
    }

    console.log('Storage directories initialized:');
    console.log('  Notes:', notesPath);
    console.log('  Index:', indexPath);
  } catch (error) {
    console.error('Failed to initialize storage directories:', error);
  }
};

/**
 * 注册IPC处理器
 */
export const registerNoteActionHandlers = () => {
  // 初始化存储目录
  initializeStorageDirectories();

  // 创建新笔记
  ipcMain.handle(
    'note:create',
    async (event, title?: string, parentId?: string) => {
      try {
        const note = await createNewNote(title, parentId);
        return { success: true, data: note };
      } catch (error) {
        console.error('Failed to create note:', error);
        return { success: false, error: error.message };
      }
    }
  );

  // 获取笔记
  ipcMain.handle('note:get', async (event, noteId: string) => {
    try {
      const note = await loadNoteById(noteId);
      return { success: true, data: note };
    } catch (error) {
      console.error('Failed to get note:', error);
      return { success: false, error: error.message };
    }
  });

  // 更新笔记字段
  ipcMain.handle(
    'note:update',
    async (event, noteId: string, updates: Partial<NotePage>) => {
      try {
        const updatedNote = await updateNoteFields(noteId, updates);
        return { success: true, data: updatedNote };
      } catch (error) {
        console.error('Failed to update note:', error);
        return { success: false, error: error.message };
      }
    }
  );

  // 删除笔记
  ipcMain.handle('note:delete', async (event, noteId: string) => {
    try {
      await deleteNote(noteId);
      return { success: true, message: 'Note deleted successfully' };
    } catch (error) {
      console.error('Failed to delete note:', error);
      return { success: false, error: error.message };
    }
  });

  // 移动笔记到垃圾桶
  ipcMain.handle('note:moveToTrash', async (event, noteId: string) => {
    try {
      const note = await moveNoteToTrash(noteId);
      return { success: true, data: note };
    } catch (error) {
      console.error('Failed to move note to trash:', error);
      return { success: false, error: error.message };
    }
  });

  // 从垃圾桶恢复笔记
  ipcMain.handle('note:restoreFromTrash', async (event, noteId: string) => {
    try {
      const note = await restoreNoteFromTrash(noteId);
      return { success: true, data: note };
    } catch (error) {
      console.error('Failed to restore note from trash:', error);
      return { success: false, error: error.message };
    }
  });

  // 归档笔记
  ipcMain.handle('note:archive', async (event, noteId: string) => {
    try {
      const note = await archiveNote(noteId);
      return { success: true, data: note };
    } catch (error) {
      console.error('Failed to archive note:', error);
      return { success: false, error: error.message };
    }
  });

  // 取消归档笔记
  ipcMain.handle('note:unarchive', async (event, noteId: string) => {
    try {
      const note = await unarchiveNote(noteId);
      return { success: true, data: note };
    } catch (error) {
      console.error('Failed to unarchive note:', error);
      return { success: false, error: error.message };
    }
  });

  // 切换笔记收藏状态
  ipcMain.handle('note:toggleFavorite', async (event, noteId: string) => {
    try {
      const note = await toggleNoteFavorite(noteId);
      return { success: true, data: note };
    } catch (error) {
      console.error('Failed to toggle note favorite:', error);
      return { success: false, error: error.message };
    }
  });

  // 获取所有笔记（从索引）
  ipcMain.handle('notes:getAll', async () => {
    try {
      const notes = await getAllNotes();
      return { success: true, data: notes };
    } catch (error) {
      console.error('Failed to get all notes:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  // 重建笔记索引
  ipcMain.handle('notes:rebuildIndex', async () => {
    try {
      await rebuildNotesIndex();
      return { success: true, message: 'Index rebuilt successfully' };
    } catch (error) {
      console.error('Failed to rebuild index:', error);
      return { success: false, error: error.message };
    }
  });
};

// 导出相关函数供其他模块使用
export {
  createNewNote,
  saveNoteToFile,
  loadNoteById,
  getAllNotes,
  updateNoteFields,
  deleteNote,
  moveNoteToTrash,
  restoreNoteFromTrash,
  archiveNote,
  unarchiveNote,
  toggleNoteFavorite,
  rebuildNotesIndex,
  updateNoteInIndex,
  removeNoteFromIndex,
};
