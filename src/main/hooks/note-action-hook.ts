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
} from '../../common/models/note.types';
import { v4 as uuidv4 } from 'uuid';

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
 * 获取所有笔记
 */
const getAllNotes = async (): Promise<NotePage[]> => {
  const notesPath = getNotesDataPath();

  try {
    await ensureDirectoryExists(notesPath);
    const files = await fs.readdir(notesPath);
    const notes = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = join(notesPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const note = JSON.parse(data);

          // 转换日期字符串回 Date 对象
          note.metadata.createdAt = new Date(note.metadata.createdAt);
          note.metadata.updatedAt = new Date(note.metadata.updatedAt);

          notes.push(note);
        } catch (error) {
          console.error(`Failed to load note ${file}:`, error);
        }
      }
    }

    // 按更新时间倒序排列
    notes.sort(
      (a, b) => b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime()
    );

    return notes;
  } catch (error) {
    console.error('Failed to load notes:', error);
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

    console.log('Storage directories initialized:');
    console.log('  Notes:', notesPath);
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

  // 获取所有笔记
  ipcMain.handle('notes:getAll', async () => {
    try {
      const notes = await getAllNotes();
      return { success: true, data: notes };
    } catch (error) {
      console.error('Failed to get all notes:', error);
      return { success: false, error: error.message, data: [] };
    }
  });
};

// 导出相关函数供其他模块使用
export { createNewNote, saveNoteToFile, loadNoteById, getAllNotes };
