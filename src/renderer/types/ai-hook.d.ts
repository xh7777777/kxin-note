/**
 * AI 聊天消息接口
 */
export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

/**
 * AI 聊天请求接口
 */
export interface AIChatRequest {
  messages: AIChatMessage[];
  configId?: string; // 如果不提供，使用默认配置
  stream?: boolean;
  systemPrompt?: string;
}

/**
 * AI 聊天响应接口
 */
export interface AIChatResponse {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

/**
 * AI 连接测试结果
 */
export interface AIConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
}

/**
 * AI 模型信息
 */
export interface AIModelInfo {
  config: any; // AIModelConfig 类型
  provider: string;
  model: string;
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
  };
}

/**
 * AI 功能 API 接口
 */
export interface AIHookAPI {
  /**
   * 发送聊天消息
   */
  chat: (request: AIChatRequest) => Promise<AIChatResponse>;

  /**
   * 测试AI配置连接
   */
  testConnection: (configId?: string) => Promise<AIConnectionTestResult>;

  /**
   * 获取AI模型信息
   */
  getModelInfo: (configId?: string) => Promise<AIModelInfo>;

  /**
   * 生成聊天标题
   */
  generateTitle: (
    messages: AIChatMessage[],
    configId?: string
  ) => Promise<string>;

  /**
   * 清除客户端缓存
   */
  clearCache: () => Promise<{ success: boolean; message: string }>;
}

declare global {
  interface Window {
    aiHook: AIHookAPI;
  }
}
