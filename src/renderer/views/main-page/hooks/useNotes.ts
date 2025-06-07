import { ref } from 'vue';
import type { NotePage } from '../../../../common/models/note.types';

function useNotes() {
  const activeNote = ref<string | null>(null);
  const notePages = ref<NotePage[]>([]);

  const createNote = async () => {
    const note = await window.noteAPI.createNote();
    console.log('创建笔记成功', note);
    notePages.value.push(note.data);
  };

  return {
    notePages,
    activeNote,
    createNote,
  };
}

export { useNotes };
