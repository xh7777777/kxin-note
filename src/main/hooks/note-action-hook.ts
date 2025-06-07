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
  NoteTreeNode,
  NoteIndexItem,
  NoteIndex,
} from '../../common/models/note.types';
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
  if (app.isPackaged) {
    // 生产模式：使用用户数据目录
    const userDataPath = app.getPath('userData');
    return join(userDataPath, 'notes');
  } else {
    // 开发模式：使用项目的assets目录
    const projectRoot = getProjectRoot();
    return join(projectRoot, 'assets', 'notes');
  }
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
    version: '2.29.0',
    blocks: [
      {
        id: generateUniqueId(),
        type: BlockType.PARAGRAPH,
        data: {
          text: '开始写笔记...',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    stats: {
      characters: 8,
      words: 1,
      paragraphs: 1,
      readingTime: 1,
      blockCount: 1,
      imageCount: 0,
    },
  };
};

/**
 * 创建新笔记
 */
const createNewNote = async (
  title: string = '无标题笔记',
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
    return index.notes;
  } catch (error) {
    console.error('Failed to load notes from index:', error);
    return [];
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
  rebuildNotesIndex,
  updateNoteInIndex,
  removeNoteFromIndex,
};
