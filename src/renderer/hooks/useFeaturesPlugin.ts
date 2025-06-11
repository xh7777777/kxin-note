/**
 * useFeaturesPlugin
 * 加载功能插件
 */
import { ref } from 'vue';

export const useFeaturesPlugin = () => {
  const features = ref<string[]>([]);

  return {
    features,
  };
};
