<template>
  <div class="demo-container">
    <h1>图标选择器演示</h1>

    <div class="demo-section">
      <h2>基本使用</h2>
      <div class="demo-content">
        <div class="selected-display">
          <div class="selected-item">
            <span class="selected-icon">{{ selectedIcon || '📝' }}</span>
            <span class="selected-label">
              {{ selectedIcon ? '已选择' : '点击选择图标' }}
            </span>
          </div>
          <button class="select-button" @click="showPicker = true">
            选择图标/表情
          </button>
        </div>

        <div v-if="selectedIcon" class="result-info">
          <p>
            <strong>选择的内容:</strong>
            {{ selectedIcon }}
          </p>
          <p>
            <strong>选择时间:</strong>
            {{ selectedTime }}
          </p>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>功能特性</h2>
      <ul class="feature-list">
        <li>✅ 支持 Emoji 表情符号选择</li>
        <li>✅ 支持图标库选择（基于 Lucide 图标）</li>
        <li>✅ 分类浏览和快速搜索</li>
        <li>✅ 最近使用记录（本地存储）</li>
        <li>✅ 肤色调节支持</li>
        <li>✅ 响应式设计和键盘导航</li>
        <li>✅ 浮窗模式，点击外部关闭</li>
      </ul>
    </div>

    <!-- 图标选择器组件 -->
    <IconPicker
      :visible="showPicker"
      @close="showPicker = false"
      @select="handleIconSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IconPicker from './iconPicker.vue';

const showPicker = ref(false);
const selectedIcon = ref('');
const selectedTime = ref('');

const handleIconSelect = (icon: string) => {
  selectedIcon.value = icon;
  selectedTime.value = new Date().toLocaleString();
  console.log('选择的图标:', icon);
};
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
  font-size: 2.5em;
  font-weight: 300;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5em;
  font-weight: 500;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.selected-display {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.selected-icon {
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.selected-label {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.select-button {
  padding: 12px 24px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.select-button:hover {
  background: #005a9e;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 122, 204, 0.3);
}

.result-info {
  padding: 16px;
  background: #e8f5e8;
  border-left: 4px solid #28a745;
  border-radius: 4px;
}

.result-info p {
  margin: 4px 0;
  font-size: 14px;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 8px 0;
  font-size: 16px;
  color: #555;
}

@media (max-width: 600px) {
  .demo-container {
    padding: 20px 15px;
  }

  .selected-display {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .selected-item {
    justify-content: center;
  }
}
</style>
