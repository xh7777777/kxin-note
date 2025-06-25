import { defineStore } from 'pinia';
import type { INote } from '@customTypes/models/note.types';

interface NoteState {
  currentNoteId: string;
  notes: INote[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export const useNoteStore = defineStore('note', {
  state: (): NoteState => ({
    currentNoteId: '',
    notes: [],
    loading: false,
    error: null,
    lastUpdated: null,
  }),

  getters: {
    getCurrentNoteId: state => state.currentNoteId,
    getCurrentNote: state =>
      state.notes.find(note => note.id === state.currentNoteId),
    getNotes: state => state.notes,
    getNotesCount: state => state.notes.length,
    isLoading: state => state.loading,
    getError: state => state.error,
    getLastUpdated: state => state.lastUpdated,

    // 筛选器
    getFavoriteNotes: state =>
      state.notes.filter(note => note.status.isFavorite),
    getArchivedNotes: state =>
      state.notes.filter(note => note.status.isArchived),
    getPinnedNotes: state => state.notes.filter(note => note.status.isPinned),
    getTrashedNotes: state => state.notes.filter(note => note.status.isTrashed),

    // 按标签分组
    getNotesByTag: state => (tag: string) =>
      state.notes.filter(note => note.metadata.tags?.includes(tag)),

    // 搜索
    searchNotes: state => (query: string) =>
      state.notes.filter(
        note =>
          note.metadata.title.toLowerCase().includes(query.toLowerCase()) ||
          note.metadata.content.toLowerCase().includes(query.toLowerCase())
      ),
  },

  actions: {
    // 基础状态管理
    setCurrentNoteId(noteId: string) {
      this.currentNoteId = noteId;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    clearError() {
      this.error = null;
    },

    // 笔记管理
    addNote(note: INote) {
      const existingIndex = this.notes.findIndex(n => n.id === note.id);
      if (existingIndex >= 0) {
        this.notes[existingIndex] = note;
      } else {
        this.notes.push(note);
      }
      this.lastUpdated = new Date().toISOString();
    },

    updateNote(noteId: string, updates: Partial<INote>) {
      const index = this.notes.findIndex(n => n.id === noteId);
      if (index >= 0) {
        this.notes[index] = { ...this.notes[index], ...updates };
        this.lastUpdated = new Date().toISOString();
      }
    },

    removeNote(noteId: string) {
      this.notes = this.notes.filter(n => n.id !== noteId);
      if (this.currentNoteId === noteId) {
        this.currentNoteId = '';
      }
      this.lastUpdated = new Date().toISOString();
    },

    setNotes(notes: INote[]) {
      this.notes = notes;
      this.lastUpdated = new Date().toISOString();
    },

    // 状态切换
    toggleFavorite(noteId: string) {
      const note = this.notes.find(n => n.id === noteId);
      if (note) {
        note.status.isFavorite = !note.status.isFavorite;
        this.lastUpdated = new Date().toISOString();
      }
    },

    toggleArchive(noteId: string) {
      const note = this.notes.find(n => n.id === noteId);
      if (note) {
        note.status.isArchived = !note.status.isArchived;
        this.lastUpdated = new Date().toISOString();
      }
    },

    togglePin(noteId: string) {
      const note = this.notes.find(n => n.id === noteId);
      if (note) {
        note.status.isPinned = !note.status.isPinned;
        this.lastUpdated = new Date().toISOString();
      }
    },

    moveToTrash(noteId: string) {
      const note = this.notes.find(n => n.id === noteId);
      if (note) {
        note.status.isTrashed = true;
        note.status.isDeleted = true;
        this.lastUpdated = new Date().toISOString();
      }
    },

    restoreFromTrash(noteId: string) {
      const note = this.notes.find(n => n.id === noteId);
      if (note) {
        note.status.isTrashed = false;
        note.status.isDeleted = false;
        this.lastUpdated = new Date().toISOString();
      }
    },

    // 批量操作
    clearAllNotes() {
      this.notes = [];
      this.currentNoteId = '';
      this.lastUpdated = new Date().toISOString();
    },

    // 统计更新
    incrementViewCount(noteId: string) {
      const note = this.notes.find(n => n.id === noteId);
      if (note) {
        note.stats.editCount += 1;
        this.lastUpdated = new Date().toISOString();
      }
    },

    incrementEditCount(noteId: string) {
      const note = this.notes.find(n => n.id === noteId);
      if (note) {
        note.stats.editCount += 1;
        this.lastUpdated = new Date().toISOString();
      }
    },
  },
});
