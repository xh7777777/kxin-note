<template>
  <!-- 收缩状态时的触发区域 -->
  <div
    v-if="isCollapsed"
    class="fixed top-10 left-0 w-16 h-16 z-50 flex items-center justify-center group transition-all duration-300"
    @mouseenter="showExpandButton = true"
    @mouseleave="showExpandButton = false"
  >
    <!-- 展开按钮 -->
    <button
      v-show="showExpandButton"
      @click="handleToggleCollapse"
      class="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-md transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm opacity-90"
    >
      <svg
        class="w-4 h-4 stroke-2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <polyline points="13,17 18,12 13,7"></polyline>
        <polyline points="6,17 11,12 6,7"></polyline>
      </svg>
    </button>
  </div>

  <!-- 主侧边栏 -->
  <div
    v-if="!isCollapsed"
    class="fixed top-0 left-0 pt-10 flex flex-col h-screen w-[280px] overflow-hidden transition-all duration-300 shadow-sm"
  >
    <!-- 搜索框 -->
    <div class="px-5 py-4 flex-shrink-0">
      <div class="relative flex gap-2">
        <div class="flex-1 relative">
          <input
            type="text"
            placeholder="Search"
            class="w-full h-8 pl-9 pr-8 rounded-md text-sm bg-white outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder-gray-400"
            v-model="searchQuery"
          />
          <svg
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 stroke-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <span
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono"
          >
            /
          </span>
        </div>

        <!-- 收缩按钮 -->
        <div class="relative group">
          <button
            @click="handleToggleCollapse"
            class="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md text-ellipsis-1"
            :title="`Collapse Sidebar (Ctrl+/)`"
          >
            <svg
              class="w-4 h-4 stroke-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <polyline points="11,17 6,12 11,7"></polyline>
              <polyline points="18,17 13,12 18,7"></polyline>
            </svg>
          </button>

          <!-- 快捷键提示 -->
          <div
            class="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
          >
            Press Ctrl+/ to toggle
          </div>
        </div>
      </div>
    </div>

    <!-- 展开状态的主要内容区域 -->
    <div class="flex-1 min-h-0 flex flex-col">
      <!-- 功能区域 -->
      <div class="px-3 mb-4 flex-shrink-0">
        <div class="flex items-center gap-2 px-3 py-2 mb-1">
          <button
            @click="toggleFeaturesExpanded"
            class="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 transition-all duration-300 ease-in-out transform cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
            :class="{ 'rotate-90': featuresExpanded }"
          >
            <svg
              class="w-3.5 h-3.5 stroke-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
          <span
            class="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-1 cursor-pointer"
            @click="toggleFeaturesExpanded"
          >
            Features
          </span>
          <!-- 新增笔记按钮 -->
          <button
            @click="handleAddNote"
            class="flex items-center justify-center w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            title="Add New Note"
          >
            <svg
              class="w-3 h-3 stroke-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <!-- Features 内容区域 -->
        <div
          class="overflow-hidden transition-all duration-300 ease-in-out"
          :style="{
            maxHeight: featuresExpanded
              ? Math.min(featuresContentHeight, 200) + 'px'
              : '0px',
            opacity: featuresExpanded ? 1 : 0,
          }"
        >
          <div
            class="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            :style="{ maxHeight: '200px' }"
            ref="featuresContent"
          >
            <div class="space-y-0.5">
              <!-- Home -->
              <div
                class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200"
                @click="handleSetActiveTab('home')"
              >
                <div class="text-base w-5 text-center">🏠</div>
                <span class="text-sm flex-1">Home</span>
              </div>

              <!-- Pageshelf -->
              <div
                class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200"
                @click="handleSetActiveTab('notePages')"
              >
                <div class="text-base w-5 text-center">📚</div>
                <span class="text-sm flex-1">My Pageshelf</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 笔记本区域 -->
      <div class="px-3 mb-4 flex-shrink-0">
        <div class="flex items-center gap-2 px-3 py-2 mb-1">
          <button
            @click="toggleNotePagesExpanded"
            class="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 transition-all duration-300 ease-in-out transform cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
            :class="{ 'rotate-90': notePagesExpanded }"
          >
            <svg
              class="w-3.5 h-3.5 stroke-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
          <span
            class="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-1 cursor-pointer"
            @click="toggleNotePagesExpanded"
          >
            NotePages
          </span>
          <button
            class="flex items-center justify-center w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            @click="handleAddNote"
            title="Add New NotePage"
          >
            <svg
              class="w-3 h-3 stroke-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <!-- NotePages 内容区域 -->
        <div
          class="overflow-hidden transition-all duration-300 ease-in-out"
          :style="{
            maxHeight: notePagesExpanded
              ? Math.min(notePagesContentHeight, 250) + 'px'
              : '0px',
            opacity: notePagesExpanded ? 1 : 0,
          }"
        >
          <div
            class="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            :style="{ maxHeight: '250px' }"
            ref="notePagesContent"
          >
            <div class="space-y-0.5">
              <div
                v-for="notePage in notePages"
                :key="notePage.id"
                class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200"
                :class="
                  activeNoteId === notePage.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                "
                @click="handleSelectNotePage(notePage.id)"
              >
                <!-- <div class="w-5 h-5 rounded flex justify-center text-xs">
                  {{ notePage.icon }}
                </div> -->
                <span class="text-sm flex-1 text-ellipsis-1">
                  {{ notePage.title || '未命名笔记' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { NoteIndexEntry } from '@customTypes/models/note.types';

// Props
const props = defineProps<{
  searchQuery: string;
  notePages: NoteIndexEntry[];
  activeNoteId: string | null;
}>();

// Emits
const emit = defineEmits<{
  'update:searchQuery': [value: string];
  'add-note': [];
  'toggle-dark-mode': [];
  'open-settings': [];
  'open-trash': [];
  'select-note': [value: string];
  'toggle-collapse': [isCollapsed: boolean];
}>();

// 收缩状态
const isCollapsed = ref(false);
const showExpandButton = ref(false);

// 展开收缩状态
const featuresExpanded = ref(true);
const notePagesExpanded = ref(true);

// 黑暗模式状态
const isDarkMode = ref(false);

// 内容区域引用和高度
const featuresContent = ref<any>(null);
const notePagesContent = ref<any>(null);
const featuresContentHeight = ref(0);
const notePagesContentHeight = ref(0);

// 计算内容高度
const calculateContentHeight = async () => {
  await nextTick();

  if (featuresContent.value) {
    // 临时展开以获取真实高度
    const originalDisplay = featuresContent.value.style.maxHeight;
    featuresContent.value.style.maxHeight = 'none';
    featuresContentHeight.value = featuresContent.value.scrollHeight;
    featuresContent.value.style.maxHeight = originalDisplay;
  }

  if (notePagesContent.value) {
    // 临时展开以获取真实高度
    const originalDisplay = notePagesContent.value.style.maxHeight;
    notePagesContent.value.style.maxHeight = 'none';
    notePagesContentHeight.value = notePagesContent.value.scrollHeight;
    notePagesContent.value.style.maxHeight = originalDisplay;
  }
};

// 快捷键处理
const handleKeyDown = (event: any) => {
  if ((event.ctrlKey || event.metaKey) && event.key === '/') {
    event.preventDefault();
    handleToggleCollapse();
  }
};

// 切换收缩状态
const handleToggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;

  // 保存状态到本地存储
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    (globalThis as any).localStorage.setItem(
      'sidebar-collapsed',
      String(isCollapsed.value)
    );
  }

  // 通知父组件
  emit('toggle-collapse', isCollapsed.value);
};

// 切换功能区域展开状态
const toggleFeaturesExpanded = () => {
  featuresExpanded.value = !featuresExpanded.value;

  // 保存状态到本地存储
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    (globalThis as any).localStorage.setItem(
      'sidebar-features-expanded',
      String(featuresExpanded.value)
    );
  }
};

// 切换笔记本区域展开状态
const toggleNotePagesExpanded = () => {
  notePagesExpanded.value = !notePagesExpanded.value;

  // 保存状态到本地存储
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(
      'sidebar-note-pages-expanded',
      String(notePagesExpanded.value)
    );
  }
};

// 从本地存储恢复展开状态
const restoreExpandedState = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const savedFeaturesState = window.localStorage.getItem(
    'sidebar-features-expanded'
  );
  const savedNotePagesState = window.localStorage.getItem(
    'sidebar-note-pages-expanded'
  );
  const savedDarkMode = window.localStorage.getItem('dark-mode');
  const savedCollapsed = window.localStorage.getItem('sidebar-collapsed');

  if (savedFeaturesState !== null) {
    featuresExpanded.value = savedFeaturesState === 'true';
  }

  if (savedNotePagesState !== null) {
    notePagesExpanded.value = savedNotePagesState === 'true';
  }

  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true';
  }

  if (savedCollapsed !== null) {
    isCollapsed.value = savedCollapsed === 'true';
    // 通知父组件初始状态
    emit('toggle-collapse', isCollapsed.value);
  }
};

// 监听笔记本数据变化，重新计算高度
watch(
  () => props.notePages,
  () => {
    calculateContentHeight();
  },
  { deep: true }
);

// 搜索查询的双向绑定
const searchQuery = computed({
  get: () => props.searchQuery,
  set: (value: string) => emit('update:searchQuery', value),
});

// 方法
const handleSetActiveTab = (_tab: string) => {
  // 功能待实现
};

const handleSelectNotePage = (notePageId: string) => {
  emit('select-note', notePageId);

  // 如果笔记本区域是收缩状态，自动展开
  if (!notePagesExpanded.value) {
    notePagesExpanded.value = true;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('sidebar-notePages-expanded', 'true');
    }
  }
};

const handleAddNote = () => {
  emit('add-note');
};

// 生命周期
onMounted(() => {
  restoreExpandedState();
  calculateContentHeight();

  // 添加全局键盘事件监听
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义滚动条样式 */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

/* 箭头旋转动画 */
.transform {
  transition: transform 0.3s ease-in-out;
}

.rotate-90 {
  transform: rotate(90deg);
}

/* 优化展开收缩动画 */
.transition-all {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .w-\[280px\] {
    width: 260px;
  }
}

/* 确保按钮不会因为聚焦而产生额外的样式 */
button:focus {
  outline: none;
}

button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
