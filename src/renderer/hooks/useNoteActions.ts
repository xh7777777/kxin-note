import type { UseNotesReturn } from './useNotes';
import { useMessage } from './useMessage';
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
} from '@customTypes/interface/noteApi.type';

/**
 * useNoteActions Hook返回接口
 */
interface UseNoteActionsReturn {
  // 组合操作方法
  addNoteAndRefresh: (request?: CreateNoteRequest) => Promise<void>;
  selectNoteById: (noteId: string) => Promise<void>;
  updateNoteItem: (noteId: string, key: string, value: any) => Promise<void>;
  moveNoteToTrash: (noteId: string) => Promise<void>;
  saveEditorContent: (newContent: string) => Promise<void>;
}

/**
 * 笔记操作组合 Hook
 * 将 useNotes 的基础方法组合成更高级的操作
 * @param notesInstance - useNotes 的实例，确保状态共享
 */
function useNoteActions(notesInstance: UseNotesReturn): UseNoteActionsReturn {
  const {
    createNote,
    getNotesList,
    getNoteById,
    updateNote,
    moveToTrash,
    state,
  } = notesInstance;

  const { success, error: showError, warning } = useMessage();

  /**
   * 添加笔记并刷新列表
   */
  async function addNoteAndRefresh(request: CreateNoteRequest = {}) {
    try {
      const response = await createNote(request);
      console.log('create note response:', response);

      if (response.success) {
        // 刷新侧边栏笔记列表
        const notesResponse = await getNotesList(true);
        console.log('refresh notes list:', notesResponse);

        if (response.data) {
          success('创建成功', '笔记已创建');
        }
      } else {
        showError('创建失败', response.error || '创建笔记时发生错误');
      }
    } catch (err) {
      console.error('添加笔记失败:', err);
      showError('创建失败', '创建笔记时发生未知错误');
    }
  }

  /**
   * 根据ID选择笔记
   */
  async function selectNoteById(noteId: string) {
    try {
      const response = await getNoteById(noteId);
      console.log('select note response:', response);

      if (!response.success) {
        showError('加载失败', response.error || '加载笔记时发生错误');
      }
    } catch (err) {
      console.error('选择笔记失败:', err);
      showError('加载失败', '加载笔记时发生未知错误');
    }
  }

  /**
   * 更新笔记项
   */
  async function updateNoteItem(noteId: string, key: string, value: any) {
    try {
      if (!state.currentNote || state.currentNote.id !== noteId) {
        console.warn('尝试更新非当前笔记');
        return;
      }

      const updateRequest: UpdateNoteRequest = {
        id: noteId,
        metadata: {
          [key]: value,
        },
        updateSearchIndex: true,
      };

      const response = await updateNote(updateRequest);
      console.log('update note item response:', response);

      if (response.success) {
        // 可以添加一些成功的反馈
        console.log(`笔记 ${key} 已更新`);
      } else {
        showError('更新失败', response.error || '更新笔记时发生错误');
      }
    } catch (err) {
      console.error('更新笔记项失败:', err);
      showError('更新失败', '更新笔记时发生未知错误');
    }
  }

  /**
   * 将笔记移动到垃圾桶
   */
  async function moveNoteToTrash(noteId: string) {
    try {
      const response = await moveToTrash(noteId);
      console.log('move to trash response:', response);

      if (response.success) {
        // 刷新笔记列表
        await getNotesList(true);
        success('移动成功', '笔记已移至垃圾桶');

        // 如果删除的是当前笔记，清空当前笔记
        if (state.currentNote?.id === noteId) {
          state.currentNote = null;
        }
      } else {
        showError('移动失败', response.error || '移动笔记到垃圾桶时发生错误');
      }
    } catch (err) {
      console.error('移动笔记到垃圾桶失败:', err);
      showError('移动失败', '移动笔记到垃圾桶时发生未知错误');
    }
  }

  /**
   * 保存编辑器内容
   */
  async function saveEditorContent(newContent: string) {
    try {
      console.log('保存编辑器内容:', newContent, state.currentNote);

      if (!state.currentNote) {
        console.warn('没有当前笔记，无法保存');
        return;
      }

      const response = await updateNote({
        id: state.currentNote.id,
        metadata: {
          content: newContent,
        },
        updateSearchIndex: true,
      });

      console.log('save editor content response:', response);

      if (response.success) {
        // 可以添加一些保存成功的反馈
        console.log('笔记内容已保存');
      } else {
        showError('保存失败', response.error || '保存笔记内容时发生错误');
      }
    } catch (err) {
      console.error('保存编辑器内容失败:', err);
      showError('保存失败', '保存笔记内容时发生未知错误');
    }
  }

  return {
    addNoteAndRefresh,
    selectNoteById,
    updateNoteItem,
    moveNoteToTrash,
    saveEditorContent,
  };
}

export { useNoteActions };
export type { UseNoteActionsReturn };
