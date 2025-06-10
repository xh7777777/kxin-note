import { ref } from 'vue';
import type {
  NoteIndexItem,
  NoteContent,
  NotePage,
} from '@common/models/note.types';

function useNotes() {
  const activeNoteId = ref<string | null>(null);
  const notePages = ref<NoteIndexItem[]>([]);
  const noteLoading = ref(false);
  const noteError = ref<string | null>(null);
  const selectedNoteContent = ref<NoteContent | null>(null);

  const createNote = async () => {
    const res = await window.noteAPI.createNote();
    if (res.success) {
      return res.data;
    }
    return null;
  };

  const getAllNotes = async () => {
    const res = await window.noteAPI.getAllNotes();
    if (res.success) {
      notePages.value = res.data || [];
    } else {
      console.error('获取笔记列表失败', res.error);
    }
  };

  const getNoteById = async (id: string) => {
    noteLoading.value = true;
    const res = await window.noteAPI.getNote(id);
    if (res.success) {
      noteLoading.value = false;
      return res.data;
    }
    noteError.value = res.error;
    noteLoading.value = false;
    return null;
  };

  const selectNote = async (id: string) => {
    if (activeNoteId.value === id) {
      return false;
    }
    activeNoteId.value = id;
    const note = await getNoteById(id);
    console.log('selectNote', note);
    if (note) {
      selectedNoteContent.value = note.content;
    }
    return true;
  };

  const updateNote = async (id: string, updates: Partial<NotePage>) => {
    const res = await window.noteAPI.updateNote(id, updates);
    if (res.success) {
      return res.data;
    }
    return null;
  };

  const updateTitle = async (id: string, title: string) => {
    const res = await window.noteAPI.updateNote(id, { title });
    if (res.success) {
      return res.data;
    }
    return null;
  };

  const updateIcon = async (id: string, icon: string) => {
    const res = await window.noteAPI.updateNote(id, { icon });
    if (res.success) {
      return res.data;
    }
    return null;
  };

  const updateContent = async (id: string, content: NoteContent) => {
    const res = await window.noteAPI.updateNote(id, { content });
    if (res.success) {
      return res.data;
    }
    return null;
  };

  return {
    notePages,
    activeNoteId,
    createNote,
    getAllNotes,
    getNoteById,
    selectNote,
    updateNote,
    updateTitle,
    updateIcon,
    updateContent,
  };
}

export { useNotes };
