import type {
  AIConfig,
  AIModelConfig,
  AIProvider,
} from '../../../customTypes/models/config.types';

/**
 * 渲染进程AI配置API接口声明
 */
export interface AIConfigAPI {
  /**
   * 获取完整的AI配置
   */
  getConfig(): Promise<AIConfig>;

  /**
   * 设置完整的AI配置
   */
  setConfig(config: AIConfig): Promise<void>;

  /**
   * 获取特定模型配置
   */
  getModelConfig(configId: string): Promise<AIModelConfig | null>;

  /**
   * 设置模型配置
   */
  setModelConfig(modelConfig: AIModelConfig): Promise<void>;

  /**
   * 删除模型配置
   */
  deleteModelConfig(configId: string): Promise<void>;

  /**
   * 获取默认模型配置
   */
  getDefaultModelConfig(): Promise<AIModelConfig | null>;

  /**
   * 设置默认模型配置
   */
  setDefaultModelConfig(configId: string): Promise<void>;

  /**
   * 创建示例配置
   */
  createSampleModelConfig(): Promise<AIModelConfig>;

  /**
   * 验证配置
   */
  validateModelConfig(
    config: AIModelConfig
  ): Promise<{ valid: boolean; errors: string[] }>;

  /**
   * 获取支持的提供商
   */
  getProviders(): Promise<AIProvider[]>;
}

declare global {
  interface Window {
    aiConfig: AIConfigAPI;
  }
}
