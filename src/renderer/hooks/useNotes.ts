import { ref, reactive, computed, readonly, type Ref } from 'vue';
import type {
  INote,
  INoteMetadata,
  INoteStatus,
  NoteIndexEntry,
} from '@customTypes/models/note.types';
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteAPIResponse,
} from '@customTypes/interface/noteApi.type';

/**
 * 笔记状态管理
 */
interface NotesState {
  loading: boolean;
  error: string | null;
  currentNote: INote | null;
  notes: INote[];
}

/**
 * useNotes Hook返回接口
 */
interface UseNotesReturn {
  // 状态
  state: NotesState;
  sideBarNotes: Ref<NoteIndexEntry[]>;
  // 计算属性
  hasNotes: Readonly<Ref<boolean>>;
  notesCount: Readonly<Ref<number>>;

  // 方法
  createNote: (request: CreateNoteRequest) => Promise<NoteAPIResponse<INote>>;
  getNoteById: (id: string) => Promise<NoteAPIResponse<INote>>;
  updateNote: (request: UpdateNoteRequest) => Promise<NoteAPIResponse<INote>>;
  setCurrentNote: (note: INote | null) => void;
  clearError: () => void;
  refreshNotes: () => Promise<void>;
  getNotesList: (
    updateList: boolean
  ) => Promise<NoteAPIResponse<NoteIndexEntry[]>>;
  moveToTrash: (noteId: string) => Promise<NoteAPIResponse<Boolean>>;
}

function useNotes(): UseNotesReturn {
  // 响应式状态
  const state = reactive<NotesState>({
    loading: false,
    error: null,
    currentNote: null,
    notes: [],
  });

  const sideBarNotes = ref<NoteIndexEntry[]>([]);

  // 计算属性
  const hasNotes = computed(() => state.notes.length > 0);
  const notesCount = computed(() => state.notes.length);

  /**
   * 获取笔记列表
   */
  async function getNotesList(
    updateList: boolean = false
  ): Promise<NoteAPIResponse<NoteIndexEntry[]>> {
    const response = await window.noteAPI.getNotesList();
    if (updateList) {
      if (response.success && response.data) {
        sideBarNotes.value = response.data;
      } else {
        sideBarNotes.value = [];
      }
    }
    return response;
  }

  /**
   * 更新状态
   */
  function updateState(updates: Partial<NotesState>) {
    Object.assign(state, updates);
  }

  /**
   * 处理错误
   */
  function handleError(err: any, message: string = '操作失败') {
    console.error(message, err);
    const errorMessage = err instanceof Error ? err.message : message;
    updateState({ error: errorMessage, loading: false });
    return {
      success: false,
      error: errorMessage,
      message,
    } as NoteAPIResponse<any>;
  }

  /**
   * 创建笔记
   */
  async function createNote(
    request: CreateNoteRequest
  ): Promise<NoteAPIResponse<INote>> {
    updateState({ loading: true, error: null });

    try {
      const response = await window.noteAPI.createNote(request);
      console.log('response', response);

      if (response.success && response.data) {
        // 更新本地状态
        const newNotes = [...state.notes, response.data];
        updateState({
          notes: newNotes,
          loading: false,
          currentNote: response.data,
        });
      } else {
        updateState({
          loading: false,
          error: response.error || '创建笔记失败',
        });
      }

      return response;
    } catch (err) {
      return handleError(err, '创建笔记失败');
    }
  }

  /**
   * 根据ID获取笔记
   */
  async function getNoteById(id: string): Promise<NoteAPIResponse<INote>> {
    updateState({ loading: true, error: null });

    try {
      // 先检查本地缓存
      const cachedNote = state.notes.find(note => note.id === id);
      if (cachedNote) {
        updateState({
          currentNote: cachedNote,
          loading: false,
        });
        return {
          success: true,
          data: cachedNote,
          message: '获取笔记成功（从缓存）',
        };
      }

      const response = await window.noteAPI.getNoteById(id);

      if (response.success && response.data) {
        // 更新本地状态
        updateState({
          currentNote: response.data,
          loading: false,
        });

        // 如果这个笔记不在列表中，添加到列表
        const noteExists = state.notes.some(note => note.id === id);
        if (!noteExists) {
          const newNotes = [...state.notes, response.data];
          updateState({ notes: newNotes });
        }

        console.log('notes', state);
      } else {
        updateState({
          loading: false,
          error: response.error || '获取笔记失败',
        });
      }

      return response;
    } catch (err) {
      return handleError(err, '获取笔记失败');
    }
  }

  /**
   * 更新笔记
   */
  async function updateNote(
    request: UpdateNoteRequest
  ): Promise<NoteAPIResponse<INote>> {
    updateState({ loading: true, error: null });

    try {
      const response = await window.noteAPI.updateNote(request);

      if (response.success && response.data) {
        // 更新本地状态
        const updatedNotes = state.notes.map(note =>
          note.id === request.id ? response.data! : note
        );

        updateState({
          notes: updatedNotes,
          loading: false,
        });

        // 如果是当前笔记，也更新当前笔记
        if (state.currentNote?.id === request.id) {
          updateState({ currentNote: response.data });
        }
      } else {
        updateState({
          loading: false,
          error: response.error || '更新笔记失败',
        });
      }

      return response;
    } catch (err) {
      return handleError(err, '更新笔记失败');
    }
  }

  /**
   * 设置当前笔记
   */
  function setCurrentNote(note: INote | null) {
    updateState({ currentNote: note });
  }

  /**
   * 清除错误
   */
  function clearError() {
    updateState({ error: null });
  }

  /**
   * 刷新笔记列表
   */
  async function refreshNotes() {
    updateState({ loading: true, error: null });

    try {
      // 暂时只是清除错误状态，未来可以实现获取所有笔记的功能
      updateState({ loading: false });
    } catch (err) {
      handleError(err, '刷新笔记列表失败');
    }
  }

  /**
   * 将笔记移到垃圾桶
   */
  async function moveToTrash(noteId: string) {
    console.log('moveToTrash', window.noteAPI);
    const response = await window.noteAPI.deleteNote(noteId);
    return response;
  }

  return {
    // 状态
    state,
    sideBarNotes,

    // 计算属性
    hasNotes,
    notesCount,

    // 方法
    createNote,
    getNoteById,
    updateNote,
    setCurrentNote,
    clearError,
    refreshNotes,
    getNotesList,
    moveToTrash,
  };
}

export { useNotes };
export type { UseNotesReturn };
