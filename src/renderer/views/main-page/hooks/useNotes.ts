import { ref } from 'vue';
import type { NoteIndexItem, NoteContent } from '@common/models/note.types';

function useNotes() {
  const activeNote = ref<string | null>(null);
  const notePages = ref<NoteIndexItem[]>([]);
  const noteLoading = ref(false);
  const noteError = ref<string | null>(null);
  const selectedNoteContent = ref<NoteContent | null>(null);

  const createNote = async () => {
    const note = await window.noteAPI.createNote();
    console.log('创建笔记成功', note);
    // notePages.value.push(note.data as NoteIndexItem);
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
    activeNote.value = id;
    const note = await getNoteById(id);
    console.log('selectNote', note);
    if (note) {
      selectedNoteContent.value = note.content;
    }
  };

  return {
    notePages,
    activeNote,
    createNote,
    getAllNotes,
    getNoteById,
    selectNote,
  };
}

export { useNotes };
