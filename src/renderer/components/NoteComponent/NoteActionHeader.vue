<template>
  <!-- 操作区 -->
  <div class="w-full h-16 bg-white flex justify-end items-center px-4 gap-2">
    <!-- 更多操作按钮 -->
    <div class="relative" ref="moreActionsRef">
      <button
        @click="toggleMoreActions"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
        title="更多操作"
      >
        <MoreHorizontal
          class="w-5 h-5 text-gray-600 group-hover:text-gray-800"
        />
      </button>

      <!-- 更多操作菜单 -->
      <div
        v-if="showMoreActions"
        class="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
      >
        <button
          @click="handleMenuAction('move-to')"
          class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <ArrowRight class="w-4 h-4" />
          移动到
        </button>
        <button
          @click="handleMenuAction('move-to-trash')"
          class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <Trash class="w-4 h-4" />
          移至垃圾桶
        </button>
        <button
          @click="handleMenuAction('translate')"
          class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <Languages class="w-4 h-4" />
          翻译
        </button>
        <div class="border-t border-gray-100 my-1"></div>
        <button
          @click="handleMenuAction('export-markdown')"
          class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <Download class="w-4 h-4" />
          导出为Markdown
        </button>
        <button
          @click="handleMenuAction('export-html')"
          class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
        >
          <Download class="w-4 h-4" />
          导出为HTML
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  MoreHorizontal,
  ArrowRight,
  Trash,
  Languages,
  Download,
} from 'lucide-vue-next';

const props = defineProps<{
  noteId: string;
}>();

const emit = defineEmits<{
  (e: 'move-to', noteId: string): void;
  (e: 'move-to-trash', noteId: string): void;
  (e: 'translate', noteId: string): void;
  (e: 'export-markdown', noteId: string): void;
  (e: 'export-html', noteId: string): void;
}>();

// 下拉菜单状态
const showMoreActions = ref(false);
const moreActionsRef = ref<HTMLElement>();

// 切换更多操作菜单
const toggleMoreActions = () => {
  showMoreActions.value = !showMoreActions.value;
};

// 处理菜单操作
const handleMenuAction = (action: string) => {
  switch (action) {
    case 'move-to':
      emit('move-to', props.noteId);
      break;
    case 'move-to-trash':
      emit('move-to-trash', props.noteId);
      break;
    case 'translate':
      emit('translate', props.noteId);
      break;
    case 'export-markdown':
      emit('export-markdown', props.noteId);
      break;
    case 'export-html':
      emit('export-html', props.noteId);
      break;
    default:
      break;
  }
  showMoreActions.value = false;
};

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (
    moreActionsRef.value &&
    !moreActionsRef.value.contains(event.target as Node)
  ) {
    showMoreActions.value = false;
  }
};

// 滚动时关闭菜单
const handleScroll = () => {
  showMoreActions.value = false;
};

onMounted(() => {
  // 添加点击外部和滚动事件监听器
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('scroll', handleScroll, true); // 使用捕获模式监听所有滚动事件
});

onUnmounted(() => {
  // 移除事件监听器
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('scroll', handleScroll, true);
});
</script>

<style lang="scss" scoped></style>
