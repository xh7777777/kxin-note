<template>
  <Teleport to="body">
    <div class="message-container">
      <TransitionGroup name="message" tag="div" class="message-list">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="getMessageClass(message.type)"
          class="message-item"
        >
          <!-- 图标 -->
          <div class="message-icon">
            <svg
              v-if="message.type === 'success'"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            <svg
              v-else-if="message.type === 'error'"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <svg
              v-else-if="message.type === 'warning'"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              ></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>

          <!-- 内容 -->
          <div class="message-content">
            <div class="message-title">{{ message.title }}</div>
            <div v-if="message.content" class="message-text">
              {{ message.content }}
            </div>
          </div>

          <!-- 关闭按钮 -->
          <button
            v-if="message.closable"
            @click="handleClose(message.id)"
            class="message-close"
          >
            <svg
              class="w-4 h-4"
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
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useMessage } from '../hooks/useMessage';
import type { MessageItem } from '../hooks/useMessage';

const { messages, removeMessage } = useMessage();

const getMessageClass = (type: MessageItem['type']) => {
  const baseClass = 'message-';
  return `${baseClass}${type}`;
};

const handleClose = (id: string) => {
  removeMessage(id);
};
</script>

<style scoped>
.message-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 400px;
  max-width: 90vw;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  pointer-events: auto;
  transition: all 0.4s ease;
  position: relative;
  min-height: 64px;
}

.message-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.message-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-title {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-text {
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.9;
}

.message-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.message-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

/* 消息类型样式 */
.message-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.message-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.message-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.message-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

/* 动画效果 */
.message-enter-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.message-leave-active {
  transition: all 0.5s ease-in;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(-80px) scale(0.8);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
}

.message-move {
  transition: transform 0.5s ease;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .message-container {
    top: 10px;
    left: 10px;
    right: 10px;
    transform: none;
  }

  .message-list {
    width: 100%;
  }

  .message-item {
    padding: 12px;
    gap: 10px;
  }

  .message-title {
    font-size: 13px;
  }

  .message-text {
    font-size: 12px;
  }
}
</style>
