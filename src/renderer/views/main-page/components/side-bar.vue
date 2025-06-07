<template>
  <div
    class="fixed top-0 left-0 w-[280px] pt-10 bg-gray-50 border-r border-gray-200 flex flex-col h-screen overflow-hidden"
  >
    <!-- 搜索框 -->
    <div class="px-5 py-4 flex-shrink-0">
      <div class="relative">
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
    </div>

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
      </div>

      <!-- Features 内容区域 -->
      <div
        class="overflow-hidden transition-all duration-300 ease-in-out"
        :style="{
          maxHeight: featuresExpanded ? featuresContentHeight + 'px' : '0px',
          opacity: featuresExpanded ? 1 : 0,
        }"
        ref="featuresContent"
      >
        <div class="space-y-0.5">
          <!-- Home -->
          <div
            class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200"
            :class="
              activeTab === 'home'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            "
            @click="handleSetActiveTab('home')"
          >
            <div class="text-base w-5 text-center">🏠</div>
            <span class="text-sm flex-1">Home</span>
          </div>

          <!-- Bookshelf -->
          <div
            class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200"
            :class="
              activeTab === 'bookshelf'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            "
            @click="handleSetActiveTab('notebooks')"
          >
            <div class="text-base w-5 text-center">📚</div>
            <span class="text-sm flex-1">My Bookshelf</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 笔记本区域 -->
    <div class="px-3 mb-4 flex-shrink-0">
      <div class="flex items-center gap-2 px-3 py-2 mb-1">
        <button
          @click="toggleNotebooksExpanded"
          class="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 transition-all duration-300 ease-in-out transform cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
          :class="{ 'rotate-90': notebooksExpanded }"
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
          @click="toggleNotebooksExpanded"
        >
          Notebooks
        </span>
        <button
          class="w-4 h-4 border-none bg-transparent cursor-pointer flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-200"
          @click="handleAddNotebook"
        >
          <svg
            class="w-3 h-3 text-gray-500 stroke-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <!-- Notebooks 内容区域 -->
      <div
        class="overflow-hidden transition-all duration-300 ease-in-out"
        :style="{
          maxHeight: notebooksExpanded ? notebooksContentHeight + 'px' : '0px',
          opacity: notebooksExpanded ? 1 : 0,
        }"
        ref="notebooksContent"
      >
        <div class="space-y-0.5">
          <div
            v-for="notebook in notebooks"
            :key="notebook.id"
            class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200"
            :class="
              activeNotebook === notebook.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            "
            @click="handleSelectNotebook(notebook.id)"
          >
            <div
              class="w-5 h-5 rounded flex items-center justify-center text-xs"
              :style="{ backgroundColor: notebook.color }"
            >
              {{ notebook.emoji }}
            </div>
            <span class="text-sm flex-1">{{ notebook.name }}</span>
            <span
              class="text-xs px-1.5 py-0.5 rounded-xl font-medium min-w-[20px] text-center"
              :class="
                activeNotebook === notebook.id
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-gray-100 text-gray-500'
              "
            >
              {{ notebook.noteCount }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 笔记列表区域 -->
    <div
      v-if="activeNotebook && notebooksExpanded"
      class="flex-1 min-h-0 flex flex-col"
    >
      <div
        class="flex-1 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="p-3 rounded-md cursor-pointer transition-all duration-200 mb-1 border border-transparent hover:bg-gray-100"
          :class="activeNoteId === note.id ? 'bg-blue-50 border-blue-200' : ''"
          @click="handleSelectNote(note.id)"
        >
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-1 leading-tight">
              {{ note.title }}
            </h4>
            <p class="text-xs text-gray-500 mb-2 leading-snug line-clamp-2">
              {{ note.preview }}
            </p>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-400">
                {{ formatDate(note.updatedAt) }}
              </span>
              <div v-if="note.tags?.length" class="flex gap-1">
                <span
                  v-for="tag in note.tags.slice(0, 2)"
                  :key="tag"
                  class="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-xl font-medium"
                >
                  {{ tag }}
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
import { computed, ref, nextTick, onMounted, watch } from 'vue';

export interface Note {
  id: string;
  title: string;
  preview: string;
  updatedAt: Date;
  tags?: string[];
  notebookId: string;
}

export interface Notebook {
  id: string;
  name: string;
  emoji: string;
  color: string;
  noteCount: number;
}

// Props
const props = defineProps<{
  searchQuery: string;
  activeTab: string;
  activeNotebook: string | null;
  activeNoteId: string | null;
  notebooks: Notebook[];
  notes: Note[];
}>();

// Emits
const emit = defineEmits<{
  'update:searchQuery': [value: string];
  'update:activeTab': [value: string];
  'update:activeNotebook': [value: string | null];
  'update:activeNoteId': [value: string | null];
  'add-notebook': [];
}>();

// 展开收缩状态
const featuresExpanded = ref(true);
const notebooksExpanded = ref(true);

// 内容区域引用和高度
const featuresContent = ref<HTMLElement>();
const notebooksContent = ref<HTMLElement>();
const featuresContentHeight = ref(0);
const notebooksContentHeight = ref(0);

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

  if (notebooksContent.value) {
    // 临时展开以获取真实高度
    const originalDisplay = notebooksContent.value.style.maxHeight;
    notebooksContent.value.style.maxHeight = 'none';
    notebooksContentHeight.value = notebooksContent.value.scrollHeight;
    notebooksContent.value.style.maxHeight = originalDisplay;
  }
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
const toggleNotebooksExpanded = () => {
  notebooksExpanded.value = !notebooksExpanded.value;

  // 保存状态到本地存储
  localStorage.setItem(
    'sidebar-notebooks-expanded',
    String(notebooksExpanded.value)
  );
};

// 从本地存储恢复展开状态
const restoreExpandedState = () => {
  const savedFeaturesState = localStorage.getItem('sidebar-features-expanded');
  const savedNotebooksState = localStorage.getItem(
    'sidebar-notebooks-expanded'
  );

  if (savedFeaturesState !== null) {
    featuresExpanded.value = savedFeaturesState === 'true';
  }

  if (savedNotebooksState !== null) {
    notebooksExpanded.value = savedNotebooksState === 'true';
  }
};

// 监听笔记本数据变化，重新计算高度
watch(
  () => props.notebooks,
  () => {
    calculateContentHeight();
  },
  { deep: true }
);

// 计算属性：过滤后的笔记
const filteredNotes = computed(() => {
  let filtered = props.notes;

  if (props.activeNotebook) {
    filtered = filtered.filter(
      note => note.notebookId === props.activeNotebook
    );
  }

  if (props.searchQuery) {
    filtered = filtered.filter(
      note =>
        note.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
        note.preview.toLowerCase().includes(props.searchQuery.toLowerCase())
    );
  }

  return filtered;
});

// 搜索查询的双向绑定
const searchQuery = computed({
  get: () => props.searchQuery,
  set: (value: string) => emit('update:searchQuery', value),
});

// 方法
const handleSetActiveTab = (tab: string) => {
  emit('update:activeTab', tab);
  if (tab !== 'notebooks') {
    emit('update:activeNotebook', null);
  }
};

const handleSelectNotebook = (notebookId: string) => {
  emit('update:activeNotebook', notebookId);
  emit('update:activeTab', 'notebooks');
  emit('update:activeNoteId', null);

  // 如果笔记本区域是收缩状态，自动展开
  if (!notebooksExpanded.value) {
    notebooksExpanded.value = true;
    localStorage.setItem('sidebar-notebooks-expanded', 'true');
  }
};

const handleSelectNote = (noteId: string) => {
  emit('update:activeNoteId', noteId);
};

const handleAddNotebook = () => {
  emit('add-notebook');

  // 如果笔记本区域是收缩状态，自动展开
  if (!notebooksExpanded.value) {
    notebooksExpanded.value = true;
    localStorage.setItem('sidebar-notebooks-expanded', 'true');
  }
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
