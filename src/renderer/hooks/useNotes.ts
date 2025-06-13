import { ref, computed } from 'vue';
import type {
  NoteIndexItem,
  NoteContent,
  NotePage,
} from '@customTypes/models/note.types';
import { useNoteStore } from '@renderer/store/modules/noteStore';

function useNotes() {
  const notePages = ref<NoteIndexItem[]>([]);
  const noteLoading = ref(false);
  const noteError = ref<string | null>(null);
  const selectedNoteContent = ref<NoteContent | null>(null);
  const noteStore = useNoteStore();
  const activeNoteId = computed(() => noteStore.getCurrentNoteId);

  const createNote = async () => {
    const res = await window.noteAPI.createNote();
    if (res.success) {
      await getAllNotes();
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
    noteStore.setCurrentNoteId(id);
    const note = await getNoteById(id);
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
