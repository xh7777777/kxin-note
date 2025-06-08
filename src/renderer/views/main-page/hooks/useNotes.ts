import { ref } from 'vue';
import type { NoteIndexItem } from '../../../../common/models/note.types';

function useNotes() {
  const activeNote = ref<string | null>(null);
  const notePages = ref<NoteIndexItem[]>([]);

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

  return {
    notePages,
    activeNote,
    createNote,
    getAllNotes,
  };
}

export { useNotes };
