<template>
  <div
    class="h-full w-full rounded-lg shadow-md overflow-hidden flex-1 relative bg-gray-50"
  >
    <!-- 垃圾桶面板容器 -->
    <div class="flex h-full flex-col">
      <!-- 头部 -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <Trash2 class="w-6 h-6 text-gray-600" />
            <div>
              <h1 class="text-xl font-semibold text-gray-900">垃圾桶</h1>
              <p class="text-sm text-gray-600 mt-1">
                已删除的笔记将在此保存30天
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="trashedNotes.length > 0"
              @click="clearAllTrash"
              class="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              清空垃圾桶
            </button>
            <button
              @click="handleClose"
              class="p-1 hover:bg-gray-100 rounded-md transition-colors"
              title="关闭垃圾桶"
            >
              <X class="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-auto p-6">
        <!-- 空状态 -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-center">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"
            ></div>
            <p class="text-gray-500">正在加载...</p>
          </div>
        </div>

        <!-- 空垃圾桶 -->
        <div
          v-else-if="trashedNotes.length === 0"
          class="flex items-center justify-center h-64"
        >
          <div class="text-center">
            <Trash2 class="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-500 mb-2">垃圾桶为空</h3>
            <p class="text-sm text-gray-400">删除的笔记将显示在这里</p>
          </div>
        </div>

        <!-- 垃圾桶笔记列表 -->
        <div v-else class="space-y-4">
          <div
            v-for="note in trashedNotes"
            :key="note.id"
            class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-medium text-gray-900 truncate">
                  {{ note.title || '未命名笔记' }}
                </h3>
                <p
                  v-if="note.summary"
                  class="text-sm text-gray-600 mt-1 line-clamp-2"
                >
                  {{ note.summary }}
                </p>
                <div
                  class="flex items-center space-x-4 mt-3 text-xs text-gray-500"
                >
                  <span class="flex items-center space-x-1">
                    <Calendar class="w-3 h-3" />
                    <span>删除于: {{ formatDate(note.updatedAt) }}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <FileText class="w-3 h-3" />
                    <span>{{ note.wordCount || 0 }} 字</span>
                  </span>
                  <span
                    v-if="note.tags.length > 0"
                    class="flex items-center space-x-1"
                  >
                    <Tag class="w-3 h-3" />
                    <span>{{ note.tags.join(', ') }}</span>
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex items-center space-x-2 ml-4">
                <button
                  @click="restoreNote(note.id)"
                  :disabled="restoring === note.id"
                  class="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
                >
                  <Undo class="w-3 h-3 mr-1 inline" />
                  恢复
                </button>
                <button
                  @click="permanentlyDelete(note.id)"
                  :disabled="deleting === note.id"
                  class="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                >
                  <Trash class="w-3 h-3 mr-1 inline" />
                  永久删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  Trash2,
  X,
  Calendar,
  FileText,
  Tag,
  Undo,
  Trash,
} from 'lucide-vue-next';
import type { NoteIndexEntry } from '@customTypes/models/note.types';
import { useNotes } from '@renderer/hooks/useNotes';
import { useMessage } from '@renderer/hooks/useMessage';

// 定义事件
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { getNotesListByFilter, restoreFromTrash, permanentlyDeleteNote } =
  useNotes();
const { success, error: showError, warning } = useMessage();

// 状态
const loading = ref(true);
const trashedNotes = ref<NoteIndexEntry[]>([]);
const restoring = ref<string | null>(null);
const deleting = ref<string | null>(null);

// 加载垃圾桶笔记
const loadTrashedNotes = async () => {
  loading.value = true;
  try {
    const response = await getNotesListByFilter({ isTrashed: true });
    if (response.success && response.data) {
      trashedNotes.value = response.data;
    } else {
      trashedNotes.value = [];
      if (response.error) {
        showError('加载失败', response.error);
      }
    }
  } catch (err) {
    console.error('加载垃圾桶笔记失败:', err);
    showError('加载失败', '加载垃圾桶笔记时发生错误');
  } finally {
    loading.value = false;
  }
};

// 恢复笔记
const restoreNote = async (noteId: string) => {
  restoring.value = noteId;
  try {
    const response = await restoreFromTrash(noteId);
    if (response.success) {
      success('恢复成功', '笔记已恢复到正常状态');
      await loadTrashedNotes(); // 重新加载列表
    } else {
      showError('恢复失败', response.error || '恢复笔记时发生错误');
    }
  } catch (err) {
    console.error('恢复笔记失败:', err);
    showError('恢复失败', '恢复笔记时发生未知错误');
  } finally {
    restoring.value = null;
  }
};

// 永久删除笔记
const permanentlyDelete = async (noteId: string) => {
  if (!confirm('确定要永久删除这篇笔记吗？此操作无法撤销！')) {
    return;
  }

  deleting.value = noteId;
  try {
    const response = await permanentlyDeleteNote(noteId);
    if (response.success) {
      success('删除成功', '笔记已永久删除');
      await loadTrashedNotes(); // 重新加载列表
    } else {
      showError('删除失败', response.error || '永久删除笔记时发生错误');
    }
  } catch (err) {
    console.error('永久删除笔记失败:', err);
    showError('删除失败', '永久删除笔记时发生未知错误');
  } finally {
    deleting.value = null;
  }
};

// 清空垃圾桶
const clearAllTrash = async () => {
  if (
    !confirm(
      '确定要清空整个垃圾桶吗？此操作将永久删除所有已删除的笔记，无法撤销！'
    )
  ) {
    return;
  }

  try {
    const deletePromises = trashedNotes.value.map(note =>
      permanentlyDeleteNote(note.id)
    );
    await Promise.all(deletePromises);
    success('清空成功', '垃圾桶已清空');
    await loadTrashedNotes();
  } catch (err) {
    console.error('清空垃圾桶失败:', err);
    showError('清空失败', '清空垃圾桶时发生错误');
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

// 处理关闭事件
const handleClose = () => {
  emit('close');
};

onMounted(() => {
  loadTrashedNotes();
});
</script>

<style lang="scss" scoped>
/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义滚动条 */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
