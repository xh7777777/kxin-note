import { ref, reactive, computed, readonly, type Ref } from 'vue';
import type {
  INote,
  INoteMetadata,
  INoteStatus,
} from '@customTypes/models/note.types';
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteAPIResponse,
} from '@customTypes/interface/noteApi.type';
import { useNoteStore } from '@renderer/store/modules/noteStore';

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
  loading: Ref<boolean>;
  error: Ref<string | null>;
  currentNote: Ref<INote | null>;
  notes: Ref<INote[]>;

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
  getNotesListAndUpdate: () => Promise<NoteAPIResponse<INote[]>>;
}

function useNotes(): UseNotesReturn {
  const noteStore = useNoteStore();

  // 响应式状态
  const state = reactive<NotesState>({
    loading: false,
    error: null,
    currentNote: null,
    notes: [],
  });

  // 响应式引用
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentNote = ref<INote | null>(null);
  const notes = ref<INote[]>([]);

  // 计算属性
  const hasNotes = computed(() => notes.value.length > 0);
  const notesCount = computed(() => notes.value.length);

  /**
   * 获取笔记列表
   */
  async function getNotesList(): Promise<NoteAPIResponse<INote[]>> {
    const response = await window.noteAPI.getNotesList();
    return response;
  }

  /**
   * 获取笔记列表, 并更新笔记列表
   */
  async function getNotesListAndUpdate(): Promise<NoteAPIResponse<INote[]>> {
    const response = await window.noteAPI.getNotesList();
    if (response.success && response.data) {
      notes.value = response.data;
    }
    return response;
  }

  /**
   * 更新状态
   */
  function updateState(updates: Partial<NotesState>) {
    Object.assign(state, updates);
    if (updates.loading !== undefined) loading.value = updates.loading;
    if (updates.error !== undefined) error.value = updates.error;
    if (updates.currentNote !== undefined)
      currentNote.value = updates.currentNote;
    if (updates.notes !== undefined) notes.value = updates.notes;
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
        const newNotes = [...notes.value, response.data];
        updateState({
          notes: newNotes,
          loading: false,
          currentNote: response.data,
        });

        // 更新store
        noteStore.setCurrentNoteId(response.data.id);
        noteStore.addNote(response.data);
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
      const cachedNote = notes.value.find(note => note.id === id);
      if (cachedNote) {
        updateState({
          currentNote: cachedNote,
          loading: false,
        });
        noteStore.setCurrentNoteId(id);
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
        const noteExists = notes.value.some(note => note.id === id);
        if (!noteExists) {
          const newNotes = [...notes.value, response.data];
          updateState({ notes: newNotes });
        }

        // 更新store
        noteStore.setCurrentNoteId(id);
        noteStore.addNote(response.data);
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
        const updatedNotes = notes.value.map(note =>
          note.id === request.id ? response.data! : note
        );

        updateState({
          notes: updatedNotes,
          loading: false,
        });

        // 如果是当前笔记，也更新当前笔记
        if (currentNote.value?.id === request.id) {
          updateState({ currentNote: response.data });
        }

        // 更新store
        noteStore.addNote(response.data);
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
    if (note) {
      noteStore.setCurrentNoteId(note.id);
    } else {
      noteStore.setCurrentNoteId('');
    }
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

  return {
    // 状态
    state,
    loading,
    error,
    currentNote,
    notes,

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
    getNotesListAndUpdate,
  };
}

export { useNotes };
