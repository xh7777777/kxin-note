// tests/main/note-action-hook.spec.ts

import { promises as fs } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import {
  createNewNote,
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
} from '../../src/common/models/note.types';

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

const mockFs = fs as jest.Mocked<typeof fs>;
const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

describe('Note Action Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mocks to default behavior
    mockFs.access.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    (
      mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
    ).mockResolvedValue(Buffer.from('{}'));
    mockFs.writeFile.mockResolvedValue(undefined);
    (
      mockFs.readdir as jest.MockedFunction<typeof fs.readdir>
    ).mockResolvedValue([]);
    mockUuidv4.mockReturnValue('test-uuid-1234');
  });

  describe('createNewNote', () => {
    it('should create a new note with default values', async () => {
      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [],
      };

      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValueOnce(Buffer.from(JSON.stringify(mockIndex)));

      const note = await createNewNote();

      expect(note.id).toBe('test-uuid-1234');
      expect(note.title).toBe('无标题笔记');
      expect(note.icon).toBe('📝');
      expect(note.level).toBe(0);
      expect(note.parentId).toBeUndefined();
      expect(note.content.blocks).toHaveLength(1);
      expect(note.content.blocks[0].type).toBe(BlockType.PARAGRAPH);
      expect(note.metadata.status).toBe(PageStatus.NORMAL);
    });

    it('should create a note with custom title', async () => {
      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [],
      };

      (
        mockFs.readFile as jest.MockedFunction<typeof fs.readFile>
      ).mockResolvedValueOnce(Buffer.from(JSON.stringify(mockIndex)));

      const title = '我的测试笔记';
      const note = await createNewNote(title);

      expect(note.title).toBe(title);
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2); // Note file + index file
    });

    it('should create a child note with correct level', async () => {
      const parentNote: NotePage = {
        id: 'parent-id',
        title: '父页面',
        level: 1,
        content: {
          time: Date.now(),
          version: '2.29.0',
          blocks: [],
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          status: PageStatus.NORMAL,
        },
      };

      const mockIndex: NoteIndex = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        notes: [],
      };

      (mockFs.readFile as jest.MockedFunction<typeof fs.readFile>)
        .mockResolvedValueOnce(Buffer.from(JSON.stringify(parentNote))) // For loading parent
        .mockResolvedValueOnce(Buffer.from(JSON.stringify(mockIndex))); // For loading index

      const note = await createNewNote('子页面', 'parent-id');

      expect(note.parentId).toBe('parent-id');
      expect(note.level).toBe(2); // Parent level + 1
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
        expect.stringContaining('test-note-id.json'),
        expect.stringContaining('"title": "测试笔记"'),
        'utf-8'
      );
    });

    it('should convert Date objects to ISO strings', async () => {
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
          createdAt: new Date('2024-01-01T10:00:00.000Z'),
          updatedAt: new Date('2024-01-01T11:00:00.000Z'),
          status: PageStatus.NORMAL,
        },
      };

      await saveNoteToFile(note);

      const writeCall = (
        mockFs.writeFile as jest.MockedFunction<typeof fs.writeFile>
      ).mock.calls[0];
      const savedData = JSON.parse(writeCall[1] as string);

      expect(savedData.metadata.createdAt).toBe('2024-01-01T10:00:00.000Z');
      expect(savedData.metadata.updatedAt).toBe('2024-01-01T11:00:00.000Z');
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

  describe('rebuildNotesIndex', () => {
    it('should rebuild index from existing notes', async () => {
      const noteFiles = ['note-1.json', 'note-2.json', 'notes-index.json'];
      (
        mockFs.readdir as jest.MockedFunction<typeof fs.readdir>
      ).mockResolvedValue(noteFiles as any);

      const note1Data = {
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

      const note2Data = {
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

      (mockFs.readFile as jest.MockedFunction<typeof fs.readFile>)
        .mockResolvedValueOnce(Buffer.from(JSON.stringify(note1Data)))
        .mockResolvedValueOnce(Buffer.from(JSON.stringify(note2Data)));

      await rebuildNotesIndex();

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('notes-index.json'),
        expect.stringContaining('"notes"'),
        'utf-8'
      );

      const writeCall = (
        mockFs.writeFile as jest.MockedFunction<typeof fs.writeFile>
      ).mock.calls[0];
      const indexData = JSON.parse(writeCall[1] as string);

      expect(indexData.notes).toHaveLength(2);
      expect(indexData.version).toBe('1.0.0');
      expect(indexData.notes[0].id).toBe('note-2'); // Should be sorted by updatedAt desc
      expect(indexData.notes[1].id).toBe('note-1');
    });

    it('should skip non-json files and index file', async () => {
      const files = [
        'note-1.json',
        'readme.txt',
        'notes-index.json',
        'note-2.json',
      ];
      (
        mockFs.readdir as jest.MockedFunction<typeof fs.readdir>
      ).mockResolvedValue(files as any);

      const noteData = {
        id: 'note-1',
        title: '笔记1',
        metadata: {
          updatedAt: '2024-01-01T10:00:00.000Z',
          createdAt: '2024-01-01T09:00:00.000Z',
        },
        level: 0,
      };

      (mockFs.readFile as jest.MockedFunction<typeof fs.readFile>)
        .mockResolvedValueOnce(Buffer.from(JSON.stringify(noteData)))
        .mockResolvedValueOnce(Buffer.from(JSON.stringify(noteData)));

      await rebuildNotesIndex();

      expect(mockFs.readFile).toHaveBeenCalledTimes(2); // Only 2 note files should be read
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
