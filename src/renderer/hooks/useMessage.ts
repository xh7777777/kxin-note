import { ref, reactive } from 'vue';
import { throttle } from 'lodash';

export interface MessageItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  content?: string;
  duration?: number;
  closable?: boolean;
}

export interface MessageOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  content?: string;
  duration?: number; // 显示时长，0表示不自动关闭
  closable?: boolean; // 是否显示关闭按钮
}

// 全局消息列表
const messages = ref<MessageItem[]>([]);

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 默认配置
const defaultOptions: Partial<MessageOptions> = {
  type: 'info',
  duration: 2000,
  closable: true,
};

export const useMessage = () => {
  // 显示消息
  const showMessage = (options: MessageOptions): string => {
    const id = generateId();
    const messageItem: MessageItem = {
      id,
      type: options.type || 'info',
      title: options.title,
      content: options.content,
      duration: options.duration ?? defaultOptions.duration,
      closable: options.closable ?? defaultOptions.closable,
    };

    messages.value.push(messageItem);

    // 自动关闭
    if (messageItem.duration && messageItem.duration > 0) {
      setTimeout(() => {
        removeMessage(id);
      }, messageItem.duration);
    }

    return id;
  };

  // 移除消息
  const removeMessage = (id: string) => {
    const index = messages.value.findIndex(msg => msg.id === id);
    if (index > -1) {
      messages.value.splice(index, 1);
    }
  };

  // 清空所有消息
  const clearMessages = () => {
    messages.value = [];
  };

  // 便捷方法
  const success = (title: string, content?: string, duration?: number) => {
    return showMessage({ type: 'success', title, content, duration });
  };

  const error = (title: string, content?: string, duration?: number) => {
    return showMessage({ type: 'error', title, content, duration });
  };

  const warning = (title: string, content?: string, duration?: number) => {
    return showMessage({ type: 'warning', title, content, duration });
  };

  const info = (title: string, content?: string, duration?: number) => {
    return showMessage({ type: 'info', title, content, duration });
  };

  return {
    messages,
    showMessage,
    removeMessage,
    clearMessages,
    success: throttle(success, 1000),
    error: throttle(error, 1000),
    warning: throttle(warning, 1000),
    info: throttle(info, 1000),
  };
};
