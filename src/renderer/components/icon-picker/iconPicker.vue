<template>
  <div v-if="visible" class="icon-picker-overlay" @click="handleOverlayClick">
    <div class="icon-picker-dialog" @click.stop>
      <!-- 头部标签页 -->
      <div class="icon-picker-header">
        <div class="tab-buttons">
          <button
            :class="['tab-button', { active: activeTab === 'emoji' }]"
            @click="activeTab = 'emoji'"
          >
            表情符号
          </button>
          <button
            :class="['tab-button', { active: activeTab === 'icons' }]"
            @click="activeTab = 'icons'"
          >
            图标
          </button>
        </div>
        <button class="close-button" @click="close">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg
            class="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="筛选..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="clear-search"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <button
          class="hand-button"
          :class="{ active: skinTone !== 'default' }"
          @click="toggleSkinTone"
        >
          ✋
        </button>
      </div>

      <!-- 最近使用 -->
      <div v-if="recentItems.length > 0" class="recent-section">
        <div class="section-title">最近</div>
        <div class="items-grid">
          <button
            v-for="item in recentItems"
            :key="item"
            class="item-button"
            @click="selectItem(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- Emoji 标签页 -->
        <div v-if="activeTab === 'emoji'" class="emoji-content">
          <!-- 分类导航 -->
          <div class="category-nav">
            <button
              v-for="category in emojiCategories"
              :key="category.id"
              :class="[
                'category-button',
                { active: activeCategory === category.id },
              ]"
              @click="activeCategory = category.id"
              :title="category.name"
            >
              {{ category.icon }}
            </button>
          </div>

          <!-- Emoji 网格 -->
          <div class="items-grid emoji-grid">
            <button
              v-for="emoji in filteredEmojis"
              :key="emoji"
              class="item-button emoji-button"
              @click="selectItem(emoji)"
              :title="getEmojiName(emoji)"
            >
              {{ applySkinTone(emoji) }}
            </button>
          </div>
        </div>

        <!-- 图标标签页 -->
        <div v-if="activeTab === 'icons'" class="icons-content">
          <!-- 图标分类 -->
          <div class="category-nav">
            <button
              v-for="category in iconCategories"
              :key="category.id"
              :class="[
                'category-button',
                { active: activeIconCategory === category.id },
              ]"
              @click="activeIconCategory = category.id"
            >
              {{ category.name }}
            </button>
          </div>

          <!-- 图标网格 -->
          <div class="items-grid icons-grid">
            <button
              v-for="icon in filteredIcons"
              :key="icon.name"
              class="item-button icon-button"
              @click="selectItem(icon.component)"
              :title="icon.name"
            >
              <component :is="icon.component" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
  Heart,
  Star,
  Smile,
  Home,
  User,
  Settings,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  File,
  Folder,
  Image,
  Music,
  Video,
  Download,
  Upload,
  Edit,
  Trash,
  Copy,
  Share,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Check,
  X,
  Arrow,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  MoreHorizontal,
  MoreVertical,
} from 'lucide-vue-next';

interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'select', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 状态管理
const activeTab = ref<'emoji' | 'icons'>('emoji');
const searchQuery = ref('');
const activeCategory = ref('people');
const activeIconCategory = ref('general');
const skinTone = ref<
  'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
>('default');
const recentItems = ref<string[]>([]);

// Emoji 数据
const emojiCategories = [
  { id: 'people', name: '人物', icon: '😀' },
  { id: 'nature', name: '自然', icon: '🌱' },
  { id: 'food', name: '食物', icon: '🍎' },
  { id: 'activity', name: '活动', icon: '⚽' },
  { id: 'travel', name: '旅行', icon: '🚗' },
  { id: 'objects', name: '物品', icon: '💡' },
  { id: 'symbols', name: '符号', icon: '❤️' },
  { id: 'flags', name: '旗帜', icon: '🏁' },
];

const emojiData = {
  people: [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '🤣',
    '😂',
    '🙂',
    '🙃',
    '😉',
    '😊',
    '😇',
    '🥰',
    '😍',
    '🤩',
    '😘',
    '😗',
    '😚',
    '😙',
    '😋',
    '😛',
    '😜',
    '🤪',
    '😝',
    '🤑',
    '🤗',
    '🤭',
    '🤫',
    '🤔',
    '🤐',
    '🤨',
    '😐',
    '😑',
    '😶',
    '😏',
    '😒',
    '🙄',
    '😬',
    '🤥',
    '😔',
    '😪',
    '🤤',
    '😴',
    '😷',
    '🤒',
    '🤕',
    '🤢',
    '🤮',
    '🤧',
    '🥵',
    '🥶',
    '🥴',
    '😵',
    '🤯',
    '🤠',
    '🥳',
    '😎',
    '🤓',
    '🧐',
  ],
  nature: [
    '🌱',
    '🌿',
    '🍀',
    '🌾',
    '🌵',
    '🌲',
    '🌳',
    '🌴',
    '🌊',
    '🌈',
    '🌙',
    '⭐',
    '🌟',
    '✨',
    '💫',
    '☀️',
    '🌤️',
    '⛅',
    '🌦️',
    '🌧️',
    '⛈️',
    '🌩️',
    '🌨️',
    '❄️',
    '☃️',
    '⛄',
    '🌬️',
    '💨',
    '🌪️',
    '🌫️',
  ],
  food: [
    '🍎',
    '🍊',
    '🍋',
    '🍌',
    '🍉',
    '🍇',
    '🍓',
    '🍈',
    '🍒',
    '🍑',
    '🥭',
    '🍍',
    '🥥',
    '🥝',
    '🍅',
    '🍆',
    '🥑',
    '🥦',
    '🥬',
    '🥒',
    '🌶️',
    '🌽',
    '🥕',
    '🧄',
    '🧅',
    '🥔',
    '🍠',
    '🥐',
    '🍞',
    '🥖',
  ],
  activity: [
    '⚽',
    '🏀',
    '🏈',
    '⚾',
    '🥎',
    '🎾',
    '🏐',
    '🏉',
    '🥏',
    '🎱',
    '🪀',
    '🏓',
    '🏸',
    '🏒',
    '🏑',
    '🥍',
    '🏏',
    '🪃',
    '🥅',
    '⛳',
    '🪁',
    '🏹',
    '🎣',
    '🤿',
    '🥊',
    '🥋',
    '🎽',
    '🛹',
    '🛷',
    '⛸️',
  ],
  travel: [
    '🚗',
    '🚕',
    '🚙',
    '🚌',
    '🚎',
    '🏎️',
    '🚓',
    '🚑',
    '🚒',
    '🚐',
    '🛻',
    '🚚',
    '🚛',
    '🚜',
    '🏍️',
    '🛵',
    '🚲',
    '🛴',
    '🛺',
    '🚨',
    '🚔',
    '🚍',
    '🚘',
    '🚖',
    '🚡',
    '🚠',
    '🚟',
    '🚃',
    '🚋',
    '🚞',
  ],
  objects: [
    '💡',
    '🔦',
    '🏮',
    '🪔',
    '📱',
    '💻',
    '⌨️',
    '🖥️',
    '🖨️',
    '🖱️',
    '🖲️',
    '💽',
    '💾',
    '💿',
    '📀',
    '📼',
    '📷',
    '📸',
    '📹',
    '🎥',
    '📽️',
    '🎞️',
    '📞',
    '☎️',
    '📟',
    '📠',
    '📺',
    '📻',
    '🎙️',
    '🎚️',
  ],
  symbols: [
    '❤️',
    '🧡',
    '💛',
    '💚',
    '💙',
    '💜',
    '🖤',
    '🤍',
    '🤎',
    '💔',
    '❣️',
    '💕',
    '💞',
    '💓',
    '💗',
    '💖',
    '💘',
    '💝',
    '💟',
    '☮️',
    '✝️',
    '☪️',
    '🕉️',
    '☸️',
    '✡️',
    '🔯',
    '🕎',
    '☯️',
    '☦️',
    '⛎',
  ],
  flags: [
    '🏁',
    '🚩',
    '🎌',
    '🏴',
    '🏳️',
    '🏳️‍🌈',
    '🏳️‍⚧️',
    '🏴‍☠️',
    '🇦🇫',
    '🇦🇱',
    '🇩🇿',
    '🇦🇸',
    '🇦🇩',
    '🇦🇴',
    '🇦🇮',
    '🇦🇶',
    '🇦🇬',
    '🇦🇷',
    '🇦🇲',
    '🇦🇼',
  ],
};

// 图标数据
const iconCategories = [
  { id: 'general', name: '常用' },
  { id: 'interface', name: '界面' },
  { id: 'media', name: '媒体' },
  { id: 'communication', name: '通讯' },
];

const iconData = {
  general: [
    { name: 'Heart', component: Heart },
    { name: 'Star', component: Star },
    { name: 'Home', component: Home },
    { name: 'User', component: User },
    { name: 'Settings', component: Settings },
    { name: 'Search', component: Search },
    { name: 'File', component: File },
    { name: 'Folder', component: Folder },
  ],
  interface: [
    { name: 'Plus', component: Plus },
    { name: 'Minus', component: Minus },
    { name: 'Check', component: Check },
    { name: 'X', component: X },
    { name: 'Menu', component: Menu },
    { name: 'MoreHorizontal', component: MoreHorizontal },
    { name: 'MoreVertical', component: MoreVertical },
    { name: 'ChevronLeft', component: ChevronLeft },
  ],
  media: [
    { name: 'Image', component: Image },
    { name: 'Music', component: Music },
    { name: 'Video', component: Video },
    { name: 'Download', component: Download },
    { name: 'Upload', component: Upload },
    { name: 'Copy', component: Copy },
    { name: 'Share', component: Share },
    { name: 'Edit', component: Edit },
  ],
  communication: [
    { name: 'Mail', component: Mail },
    { name: 'Phone', component: Phone },
    { name: 'Calendar', component: Calendar },
    { name: 'Clock', component: Clock },
    { name: 'Lock', component: Lock },
    { name: 'Unlock', component: Unlock },
    { name: 'Eye', component: Eye },
    { name: 'EyeOff', component: EyeOff },
  ],
};

// 计算属性
const filteredEmojis = computed(() => {
  const emojis =
    emojiData[activeCategory.value as keyof typeof emojiData] || [];
  if (!searchQuery.value) return emojis;

  // 简单的搜索过滤
  return emojis.filter(emoji => {
    const name = getEmojiName(emoji).toLowerCase();
    return name.includes(searchQuery.value.toLowerCase());
  });
});

const filteredIcons = computed(() => {
  const icons =
    iconData[activeIconCategory.value as keyof typeof iconData] || [];
  if (!searchQuery.value) return icons;

  return icons.filter(icon =>
    icon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 方法
const handleOverlayClick = () => {
  close();
};

const close = () => {
  emit('close');
};

const selectItem = (item: string) => {
  // 添加到最近使用
  const recentIndex = recentItems.value.indexOf(item);
  if (recentIndex > -1) {
    recentItems.value.splice(recentIndex, 1);
  }
  recentItems.value.unshift(item);
  recentItems.value = recentItems.value.slice(0, 16); // 保持最多16个最近项目

  // 保存到本地存储
  localStorage.setItem('iconPicker-recent', JSON.stringify(recentItems.value));

  emit('select', item);
  close();
};

const getEmojiName = (emoji: string): string => {
  // 这里可以添加更详细的emoji名称映射
  const emojiNames: Record<string, string> = {
    '😀': 'grinning face',
    '😃': 'grinning face with big eyes',
    '😄': 'grinning face with smiling eyes',
    '❤️': 'red heart',
    '💙': 'blue heart',
    '💚': 'green heart',
  };
  return emojiNames[emoji] || 'emoji';
};

const applySkinTone = (emoji: string): string => {
  // 简化的肤色处理
  if (skinTone.value === 'default') return emoji;

  const skinToneModifiers = {
    light: '🏻',
    'medium-light': '🏼',
    medium: '🏽',
    'medium-dark': '🏾',
    dark: '🏿',
  };

  const modifier =
    skinToneModifiers[skinTone.value as keyof typeof skinToneModifiers];
  return modifier ? emoji + modifier : emoji;
};

const toggleSkinTone = () => {
  const tones = [
    'default',
    'light',
    'medium-light',
    'medium',
    'medium-dark',
    'dark',
  ] as const;
  const currentIndex = tones.indexOf(skinTone.value);
  skinTone.value = tones[(currentIndex + 1) % tones.length];
};

// 生命周期
onMounted(() => {
  // 从本地存储加载最近使用的项目
  const saved = localStorage.getItem('iconPicker-recent');
  if (saved) {
    try {
      recentItems.value = JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse recent items from localStorage');
    }
  }
});

// 监听搜索变化，重置分类
watch(searchQuery, () => {
  if (searchQuery.value && activeTab.value === 'emoji') {
    activeCategory.value = 'people'; // 默认显示人物分类
  }
});
</script>

<style scoped>
.icon-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.icon-picker-dialog {
  width: 420px;
  height: 480px;
  background: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  color: #ffffff;
  overflow: hidden;
}

.icon-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #333;
}

.tab-buttons {
  display: flex;
  gap: 8px;
}

.tab-button {
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: #888;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #333;
}

.tab-button.active {
  background: #007acc;
  color: white;
}

.close-button {
  padding: 8px;
  background: transparent;
  border: none;
  color: #888;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: #333;
  color: white;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #333;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #888;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #333;
  border: 1px solid #444;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #007acc;
}

.search-input::placeholder {
  color: #888;
}

.clear-search {
  position: absolute;
  right: 8px;
  padding: 4px;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-search:hover {
  background: #444;
  color: white;
}

.hand-button {
  padding: 8px 12px;
  background: #333;
  border: 1px solid #444;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.hand-button:hover,
.hand-button.active {
  background: #007acc;
  border-color: #007acc;
}

.recent-section {
  padding: 16px;
  border-bottom: 1px solid #333;
}

.section-title {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.content-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.emoji-content,
.icons-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.category-nav {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  border-bottom: 1px solid #333;
  overflow-x: auto;
}

.category-nav::-webkit-scrollbar {
  height: 4px;
}

.category-nav::-webkit-scrollbar-track {
  background: #333;
}

.category-nav::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 2px;
}

.category-button {
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #888;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s;
}

.category-button:hover {
  background: #333;
}

.category-button.active {
  background: #007acc;
  color: white;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

.items-grid::-webkit-scrollbar {
  width: 8px;
}

.items-grid::-webkit-scrollbar-track {
  background: #333;
}

.items-grid::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.item-button {
  aspect-ratio: 1;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  transition: all 0.2s;
}

.item-button:hover {
  background: #333;
  transform: scale(1.1);
}

.emoji-button {
  font-size: 22px;
}

.icon-button {
  color: #888;
}

.icon-button:hover {
  color: white;
}

.icons-grid {
  grid-template-columns: repeat(6, 1fr);
}
</style>
