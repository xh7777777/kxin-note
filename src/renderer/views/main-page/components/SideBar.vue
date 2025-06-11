<template>
  <div
    class="fixed top-0 left-0 pt-10 bg-gray-50 border-r border-gray-200 flex flex-col h-screen overflow-hidden transition-all duration-300"
    :class="isCollapsed ? 'w-[60px]' : 'w-[280px]'"
  >
    <!-- 搜索框 -->
    <div class="px-5 py-4 flex-shrink-0" v-if="!isCollapsed">
      <div class="relative flex gap-2">
        <div class="flex-1 relative">
          <input
            type="text"
            placeholder="Search"
            class="w-full h-8 pl-9 pr-8 border border-gray-200 rounded-md text-sm bg-white outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder-gray-400"
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
        <button
          @click="handleToggleCollapse"
          class="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
          title="Collapse Sidebar"
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
      </div>
    </div>

    <!-- 收缩状态的顶部按钮 -->
    <div class="px-3 py-4 flex-shrink-0" v-if="isCollapsed">
      <div class="flex flex-col gap-2">
        <!-- 展开按钮 -->
        <button
          @click="handleToggleCollapse"
          class="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md mx-auto"
          title="Expand Sidebar"
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

        <!-- 新增笔记按钮 -->
        <button
          @click="handleAddNote"
          class="flex items-center justify-center w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md mx-auto"
          title="Add New Note"
        >
          <svg
            class="w-4 h-4 stroke-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- 展开状态的主要内容区域 -->
    <div class="flex-1 min-h-0 flex flex-col" v-if="!isCollapsed">
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
                <div
                  class="w-5 h-5 rounded flex items-center justify-center text-xs"
                >
                  {{ notePage.icon }}
                </div>
                <span class="text-sm flex-1">
                  {{ notePage.title || '未命名笔记' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 收缩状态的主要内容区域 -->
    <div class="flex-1 min-h-0 flex flex-col px-3" v-if="isCollapsed">
      <!-- 功能区域图标 -->
      <div class="mb-4 flex-shrink-0">
        <div class="flex flex-col gap-2">
          <!-- Home -->
          <button
            class="flex items-center justify-center w-8 h-8 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-200 text-gray-600"
            @click="handleSetActiveTab('home')"
            title="Home"
          >
            <div class="text-base">🏠</div>
          </button>

          <!-- Pageshelf -->
          <button
            class="flex items-center justify-center w-8 h-8 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-200 text-gray-600"
            @click="handleSetActiveTab('notePages')"
            title="My Pageshelf"
          >
            <div class="text-base">📚</div>
          </button>
        </div>
      </div>

      <!-- 笔记列表指示器 -->
      <div
        class="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        <div
          v-for="notePage in notePages"
          :key="notePage.id"
          class="w-8 h-2 rounded-full cursor-pointer transition-all duration-200"
          :class="
            activeNoteId === notePage.id
              ? 'bg-indigo-600'
              : 'bg-gray-300 hover:bg-gray-400'
          "
          @click="handleSelectNotePage(notePage.id)"
          :title="notePage.title"
        ></div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="flex-shrink-0 px-3 py-3 border-t border-gray-200 bg-gray-50">
      <div
        class="flex items-center gap-2"
        :class="isCollapsed ? 'flex-col' : 'justify-between'"
      >
        <!-- 黑暗模式切换 -->
        <button
          @click="handleToggleDarkMode"
          class="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
          title="Toggle Dark Mode"
        >
          <svg
            v-if="!isDarkMode"
            class="w-4 h-4 stroke-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg
            v-else
            class="w-4 h-4 stroke-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>

        <!-- 设置 -->
        <button
          @click="handleOpenSettings"
          class="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
          title="Settings"
        >
          <svg
            class="w-4 h-4 stroke-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M12 1v6m0 6v6m11-7h-6m-6 0H1m5.636-5.636l4.243 4.243m4.243 4.243l4.243 4.243M7.757 16.243l4.243-4.243"
            ></path>
          </svg>
        </button>

        <!-- 垃圾桶 -->
        <button
          @click="handleOpenTrash"
          class="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
          title="Trash"
        >
          <svg
            class="w-4 h-4 stroke-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <polyline points="3,6 5,6 21,6"></polyline>
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            ></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, watch } from 'vue';
import { NoteIndexItem } from '@customTypes/models/note.types';

// Props
const props = defineProps<{
  searchQuery: string;
  notePages: NoteIndexItem[];
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

// 展开收缩状态
const featuresExpanded = ref(true);
const notePagesExpanded = ref(true);

// 黑暗模式状态
const isDarkMode = ref(false);

// 内容区域引用和高度
const featuresContent = ref<HTMLElement>();
const notePagesContent = ref<HTMLElement>();
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

// 切换收缩状态
const handleToggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;

  // 保存状态到本地存储
  localStorage.setItem('sidebar-collapsed', String(isCollapsed.value));

  // 通知父组件
  emit('toggle-collapse', isCollapsed.value);
};

// 切换功能区域展开状态
const toggleFeaturesExpanded = () => {
  featuresExpanded.value = !featuresExpanded.value;

  // 保存状态到本地存储
  localStorage.setItem(
    'sidebar-features-expanded',
    String(featuresExpanded.value)
  );
};

// 切换笔记本区域展开状态
const toggleNotePagesExpanded = () => {
  notePagesExpanded.value = !notePagesExpanded.value;

  // 保存状态到本地存储
  localStorage.setItem(
    'sidebar-note-pages-expanded',
    String(notePagesExpanded.value)
  );
};

// 从本地存储恢复展开状态
const restoreExpandedState = () => {
  const savedFeaturesState = localStorage.getItem('sidebar-features-expanded');
  const savedNotePagesState = localStorage.getItem(
    'sidebar-note-pages-expanded'
  );
  const savedDarkMode = localStorage.getItem('dark-mode');
  const savedCollapsed = localStorage.getItem('sidebar-collapsed');

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
const handleSetActiveTab = (tab: string) => {};

const handleSelectNotePage = (notePageId: string) => {
  emit('select-note', notePageId);

  // 如果笔记本区域是收缩状态，自动展开
  if (!notePagesExpanded.value) {
    notePagesExpanded.value = true;
    localStorage.setItem('sidebar-notePages-expanded', 'true');
  }
};

const handleAddNote = () => {
  emit('add-note');
};

// 工具栏方法
const handleToggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('dark-mode', String(isDarkMode.value));
  emit('toggle-dark-mode');
};

const handleOpenSettings = () => {
  emit('open-settings');
};

const handleOpenTrash = () => {
  emit('open-trash');
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// 生命周期
onMounted(() => {
  restoreExpandedState();
  calculateContentHeight();
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
