<template>
  <!-- 重命名弹窗 -->
  <Transition name="modal">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="handleModalBackdropClick"
    >
      <div
        class="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw] mx-4 transform transition-all duration-300"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">重命名笔记</h3>
          <button
            @click="handleCancel"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            笔记名称
          </label>
          <input
            ref="renameInputRef"
            v-model="newNoteName"
            @keyup.enter="handleConfirm"
            @keyup.escape="handleCancel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
            placeholder="请输入笔记名称"
            maxlength="100"
          />
          <div class="mt-1 text-xs text-gray-500">
            {{ newNoteName.length }}/100
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="handleCancel"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            @click="handleConfirm"
            :disabled="
              !newNoteName.trim() || newNoteName.trim() === originalName
            "
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { X } from 'lucide-vue-next';

interface Props {
  visible: boolean;
  originalName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'confirm', newName: string): void;
  (e: 'cancel'): void;
}>();

// 本地状态
const newNoteName = ref('');
const renameInputRef = ref<HTMLInputElement>();

// 监听visible变化，当弹窗显示时初始化输入框
watch(
  () => props.visible,
  visible => {
    if (visible) {
      newNoteName.value = props.originalName;

      // 聚焦到输入框并选中所有文本
      nextTick(() => {
        if (renameInputRef.value) {
          renameInputRef.value.focus();
          renameInputRef.value.select();
        }
      });
    } else {
      // 弹窗关闭时清理状态
      newNoteName.value = '';
    }
  }
);

// 处理蒙层点击
const handleModalBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleCancel();
  }
};

// 确认重命名
const handleConfirm = () => {
  const trimmedName = newNoteName.value.trim();
  if (trimmedName && trimmedName !== props.originalName) {
    emit('confirm', trimmedName);
  }
};

// 取消重命名
const handleCancel = () => {
  emit('cancel');
};
</script>

<style lang="scss" scoped>
/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9) translateY(-10px);
  opacity: 0;
}

.modal-enter-to .bg-white,
.modal-leave-from .bg-white {
  transform: scale(1) translateY(0);
  opacity: 1;
}
</style>
