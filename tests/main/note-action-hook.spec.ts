// tests/main/note-action-hook.spec.ts

import { promises as fs } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import {
  createNewNote,
  getNoteDirectoryPath,
  getNoteFilePath,
  getNotesIndexPath,
  getNotesDataPath,
  initializeStorageDirectories,
  saveNoteToFile,
  loadNoteById,
  getAllNotes,
  rebuildNotesIndex,
  updateNoteInIndex,
  removeNoteFromIndex,
} from '../../src/main/hooks/note-action-hook';
import {
  NotePage,
  PageStatus,
  BlockType,
  NoteIndexItem,
  NoteIndex,
} from '../../customTypes/models/note.types';

// Mock electron app
jest.mock('electron', () => ({
  app: {
    isPackaged: false,
    getPath: jest.fn((path: string) => {
      if (path === 'userData') {
        return '/tmp/test-user-data';
      }
      return '/tmp';
    }),
    getAppPath: jest.fn(() => '/tmp/app'),
  },
  ipcMain: {
    handle: jest.fn(),
  },
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

// Mock fs promises
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
  },
}));

// Mock console.log to avoid output during tests
jest.spyOn(console, 'log').mockImplementation(() => {});

const mockFs = fs as jest.Mocked<typeof fs>;
const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

describe('Note Action Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mocks to default behavior
    mockFs.access.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue(Buffer.from('{}'));
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.readdir.mockResolvedValue([]);
    mockUuidv4.mockReturnValue('test-uuid-1234' as any);
  });

  describe('initializeStorageDirectories', () => {
    it('should initialize storage directories', async () => {
      // Mock access to simulate index file not existing
      mockFs.access.mockRejectedValueOnce(new Error('Index not found'));

      await initializeStorageDirectories();

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('notes'),
        expect.any(Object)
      );
    });

    it('should rebuild index when index not found', async () => {
      mockFs.access.mockRejectedValue(new Error('Index not found'));

      await initializeStorageDirectories();

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('notes-index.json'),
        expect.any(String),
        'utf-8'
      );
    });
  });

  describe('rebuildNotesIndex', () => {
    it('should rebuild notes index ', async () => {
      // 模拟目录读取
      const mockDir = ['note-1', 'note-2'];
      (
        mockFs.readdir as jest.MockedFunction<typeof fs.readdir>
      ).mockResolvedValue(mockDir as any);

      // 模拟笔记文件内容
      const mockNote1 = {
        id: 'note-1',
        title: '笔记1',
        icon: '📝',
        metadata: {
          updatedAt: '2024-01-01T10:00:00.000Z',
          createdAt: '2024-01-01T09:00:00.000Z',
        },
        level: 0,
        isFavorite: false,
        isArchived: false,
      };

      const mockNote2 = {
        id: 'note-2',
        title: '笔记2',
        icon: '📄',
        metadata: {
          updatedAt: '2024-01-01T11:00:00.000Z',
          createdAt: '2024-01-01T10:00:00.000Z',
        },
        level: 1,
        isFavorite: true,
        isArchived: false,
      };

      // 模拟文件读取
      (mockFs.readFile as jest.MockedFunction<typeof fs.readFile>)
        .mockResolvedValueOnce(Buffer.from(JSON.stringify(mockNote1)))
        .mockResolvedValueOnce(Buffer.from(JSON.stringify(mockNote2)));

      // Mock mkdir to be called by ensureDirectoryExists
      mockFs.access.mockRejectedValue(new Error('Directory not found'));

      await rebuildNotesIndex();

      // 验证目录创建
      expect(mockFs.mkdir).toHaveBeenCalled();

      // 验证写入的索引内容
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('notes-index.json'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should create empty index when directory is empty', async () => {
      (
        mockFs.readdir as jest.MockedFunction<typeof fs.readdir>
      ).mockResolvedValue([]);

      // Mock mkdir to be called by ensureDirectoryExists
      mockFs.access.mockRejectedValue(new Error('Directory not found'));

      await rebuildNotesIndex();

      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        'Rebuilt notes index with 0 notes'
      );
    });

    it('should handle error when reading file', async () => {
      (
        mockFs.readdir as jest.MockedFunction<typeof fs.readdir>
      ).mockResolvedValue(['note-1'] as any);

      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockRejectedValue(new Error('读取文件失败'));

      await expect(rebuildNotesIndex()).rejects.toThrow('读取文件失败');
    });
  });

  describe('createNewNote', () => {
    it('should create a new note with default values', async () => {
      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [],
      };

      // Mock loadNotesIndex behavior
      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValueOnce(Buffer.from(JSON.stringify(mockIndex)));

      // Mock mkdir to be called by createNoteDirectory and ensureDirectoryExists
      mockFs.access.mockRejectedValue(new Error('Directory not found'));

      const note = await createNewNote();

      expect(note.id).toBe('test-uuid-1234');
      expect(note.title).toBe('');
      expect(note.icon).toBe('📝');
      expect(note.level).toBe(0);
      expect(note.parentId).toBeUndefined();
      expect(note.content.blocks).toHaveLength(0);
      expect(note.metadata.status).toBe(PageStatus.NORMAL);
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2); // Note file + index file
      expect(mockFs.mkdir).toHaveBeenCalled();
    });

    it('should create at right directory', async () => {
      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [],
      };

      // Mock loadNotesIndex behavior
      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValueOnce(Buffer.from(JSON.stringify(mockIndex)));

      // Mock mkdir to be called by createNoteDirectory and ensureDirectoryExists
      mockFs.access.mockRejectedValue(new Error('Directory not found'));

      const note = await createNewNote();
      const noteDirectoryPath = getNoteDirectoryPath(note.id);
      expect(noteDirectoryPath).toBe(join(getNotesDataPath(), note.id));
      const noteFilePath = getNoteFilePath(note.id);
      expect(noteFilePath).toBe(join(noteDirectoryPath, 'note.json'));
    });

    it('should update index when note is created', async () => {
      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [],
      };
      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValueOnce(Buffer.from(JSON.stringify(mockIndex)));

      // Mock mkdir to be called by createNoteDirectory and ensureDirectoryExists
      mockFs.access.mockRejectedValue(new Error('Directory not found'));

      const note = await createNewNote();
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('notes-index.json'),
        expect.stringContaining(note.id),
        'utf-8'
      );
    });
  });

  describe('saveNoteToFile', () => {
    it('should save note to correct file path', async () => {
      const note: NotePage = {
        id: 'test-note-id',
        title: '测试笔记',
        level: 0,
        content: {
          time: Date.now(),
          version: '2.29.0',
          blocks: [],
        },
        metadata: {
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          status: PageStatus.NORMAL,
        },
      };

      await saveNoteToFile(note);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test-note-id'),
        expect.stringContaining('"title": "测试笔记"'),
        'utf-8'
      );
    });
  });

  describe('loadNoteById', () => {
    it('should load and parse note correctly', async () => {
      const noteData = {
        id: 'test-note-id',
        title: '测试笔记',
        level: 0,
        content: {
          time: Date.now(),
          version: '2.29.0',
          blocks: [],
        },
        metadata: {
          createdAt: '2024-01-01T10:00:00.000Z',
          updatedAt: '2024-01-01T11:00:00.000Z',
          status: PageStatus.NORMAL,
        },
      };

      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValue(Buffer.from(JSON.stringify(noteData)));

      const note = await loadNoteById('test-note-id');

      expect(note.id).toBe('test-note-id');
      expect(note.title).toBe('测试笔记');
      expect(note.metadata.createdAt).toBeInstanceOf(Date);
      expect(note.metadata.updatedAt).toBeInstanceOf(Date);
      expect(note.metadata.createdAt.toISOString()).toBe(
        '2024-01-01T10:00:00.000Z'
      );
    });

    it('should throw error when note not found', async () => {
      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockRejectedValue(new Error('File not found'));

      await expect(loadNoteById('non-existent-id')).rejects.toThrow(
        'Note not found: non-existent-id'
      );
    });
  });

  describe('getAllNotes', () => {
    it('should return notes from index', async () => {
      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [
          {
            id: 'note-1',
            title: '笔记1',
            icon: '📝',
            filePath: '/path/to/note-1.json',
            updatedAt: '2024-01-01T10:00:00.000Z',
            createdAt: '2024-01-01T09:00:00.000Z',
            level: 0,
            isFavorite: false,
            isArchived: false,
          },
          {
            id: 'note-2',
            title: '笔记2',
            icon: '📄',
            filePath: '/path/to/note-2.json',
            updatedAt: '2024-01-01T11:00:00.000Z',
            createdAt: '2024-01-01T10:00:00.000Z',
            level: 0,
            isFavorite: true,
            isArchived: false,
          },
        ],
      };

      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValue(Buffer.from(JSON.stringify(mockIndex)));

      const notes = await getAllNotes();

      expect(notes).toHaveLength(2);
      expect(notes[0].id).toBe('note-1');
      expect(notes[1].id).toBe('note-2');
      expect(notes[1].isFavorite).toBe(true);
    });

    it('should return empty array when index fails to load', async () => {
      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockRejectedValue(new Error('File not found'));

      const notes = await getAllNotes();

      expect(notes).toEqual([]);
    });
  });

  describe('updateNoteInIndex', () => {
    it('should add new note to index', async () => {
      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [],
      };

      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValue(Buffer.from(JSON.stringify(mockIndex)));

      const note: NotePage = {
        id: 'new-note',
        title: '新笔记',
        icon: '📝',
        level: 0,
        content: { time: Date.now(), version: '2.29.0', blocks: [] },
        metadata: {
          createdAt: new Date('2024-01-01T10:00:00.000Z'),
          updatedAt: new Date('2024-01-01T10:00:00.000Z'),
          status: PageStatus.NORMAL,
        },
        isFavorite: false,
        isArchived: false,
      };

      await updateNoteInIndex(note);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('notes-index.json'),
        expect.stringContaining('"new-note"'),
        'utf-8'
      );
    });

    it('should update existing note in index', async () => {
      const existingNote: NoteIndexItem = {
        id: 'existing-note',
        title: '旧标题',
        icon: '📝',
        filePath: '/path/to/note.json',
        updatedAt: '2024-01-01T09:00:00.000Z',
        createdAt: '2024-01-01T08:00:00.000Z',
        level: 0,
        isFavorite: false,
        isArchived: false,
      };

      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [existingNote],
      };

      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValue(Buffer.from(JSON.stringify(mockIndex)));

      const updatedNote: NotePage = {
        id: 'existing-note',
        title: '新标题',
        icon: '📄',
        level: 0,
        content: { time: Date.now(), version: '2.29.0', blocks: [] },
        metadata: {
          createdAt: new Date('2024-01-01T08:00:00.000Z'),
          updatedAt: new Date('2024-01-01T11:00:00.000Z'),
          status: PageStatus.NORMAL,
        },
        isFavorite: true,
        isArchived: false,
      };

      await updateNoteInIndex(updatedNote);

      const writeCall = (
        mockFs.writeFile as jest.MockedFunction<typeof fs.writeFile>
      ).mock.calls[0];
      const indexData = JSON.parse(writeCall[1] as string);

      expect(indexData.notes).toHaveLength(1);
      expect(indexData.notes[0].title).toBe('新标题');
      expect(indexData.notes[0].icon).toBe('📄');
      expect(indexData.notes[0].isFavorite).toBe(true);
    });
  });

  describe('removeNoteFromIndex', () => {
    it('should remove note from index', async () => {
      const note1: NoteIndexItem = {
        id: 'note-1',
        title: '笔记1',
        filePath: '/path/to/note-1.json',
        updatedAt: '2024-01-01T10:00:00.000Z',
        createdAt: '2024-01-01T09:00:00.000Z',
        level: 0,
      };

      const note2: NoteIndexItem = {
        id: 'note-2',
        title: '笔记2',
        filePath: '/path/to/note-2.json',
        updatedAt: '2024-01-01T11:00:00.000Z',
        createdAt: '2024-01-01T10:00:00.000Z',
        level: 0,
      };

      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [note1, note2],
      };

      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValue(Buffer.from(JSON.stringify(mockIndex)));

      await removeNoteFromIndex('note-1');

      const writeCall = (
        mockFs.writeFile as jest.MockedFunction<typeof fs.writeFile>
      ).mock.calls[0];
      const indexData = JSON.parse(writeCall[1] as string);

      expect(indexData.notes).toHaveLength(1);
      expect(indexData.notes[0].id).toBe('note-2');
    });

    it('should handle removing non-existent note', async () => {
      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [],
      };

      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValue(Buffer.from(JSON.stringify(mockIndex)));

      await removeNoteFromIndex('non-existent');

      const writeCall = (
        mockFs.writeFile as jest.MockedFunction<typeof fs.writeFile>
      ).mock.calls[0];
      const indexData = JSON.parse(writeCall[1] as string);

      expect(indexData.notes).toHaveLength(0);
    });
  });
});
