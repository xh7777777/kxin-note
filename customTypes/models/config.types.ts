/**
 * AI 模型提供商枚举
 */
export interface AIProvider {
  /** 提供商 ID */
  id: string;
  /** 提供商名称 */
  name: string;
  /** 提供商描述 */
  description?: string;
  /** 官网地址 */
  website?: string;
  /** 是否需要 API Key */
  requiresApiKey: boolean;
  /** 默认 API 端点 */
  defaultEndpoint: string;
  /** 支持的模型列表 */
  supportedModels: AIModel[];
}

/**
 * AI 模型定义
 */
export interface AIModel {
  /** 模型 ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 模型描述 */
  description?: string;
  /** 上下文长度限制 */
  contextLength: number;
  /** 最大输出 tokens */
  maxOutputTokens: number;
  /** 是否支持流式输出 */
  supportsStreaming: boolean;
  /** 是否支持函数调用 */
  supportsFunctionCalling: boolean;
  /** 是否支持图像理解 */
  supportsVision: boolean;
  /** 模型费用（每 1K tokens） */
  pricing?: {
    input: number;
    output: number;
    currency: string;
  };
}

/**
 * AI 模型配置
 */
export interface AIModelConfig {
  /** 配置 ID */
  id: string;
  /** 配置名称 */
  name: string;
  /** 是否启用 */
  enabled: boolean;
  /** 是否为默认配置 */
  isDefault: boolean;
  /** 提供商 ID */
  providerId: string;
  /** 模型 ID */
  modelId: string;
  /** API Key */
  apiKey: string;
  /** API 端点 */
  endpoint: string;
  /** 组织 ID（OpenAI） */
  organizationId?: string;
  /** 项目 ID */
  projectId?: string;
  /** 请求参数 */
  parameters: AIModelParameters;
  /** 代理设置 */
  proxy?: ProxyConfig;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 超时设置（毫秒） */
  timeout: number;
  /** 重试次数 */
  retryCount: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * AI 模型参数
 */
export interface AIModelParameters {
  /** 温度参数 (0-2) */
  temperature: number;
  /** Top-p 参数 (0-1) */
  topP: number;
  /** Top-k 参数 */
  topK?: number;
  /** 最大输出 tokens */
  maxTokens: number;
  /** 停止词 */
  stopSequences?: string[];
  /** 频率惩罚 (-2 到 2) */
  frequencyPenalty: number;
  /** 存在惩罚 (-2 到 2) */
  presencePenalty: number;
  /** 重复惩罚 */
  repetitionPenalty?: number;
  /** 是否启用流式输出 */
  stream: boolean;
  /** 系统提示词 */
  systemPrompt?: string;
}

/**
 * 代理配置
 */
export interface ProxyConfig {
  /** 是否启用代理 */
  enabled: boolean;
  /** 代理类型 */
  type: 'http' | 'https' | 'socks4' | 'socks5';
  /** 代理主机 */
  host: string;
  /** 代理端口 */
  port: number;
  /** 用户名 */
  username?: string;
  /** 密码 */
  password?: string;
}

/**
 * AI 配置文件主结构
 */
export interface AIConfig {
  /** 配置版本 */
  version: string;
  /** 配置名称 */
  name: string;
  /** 配置描述 */
  description?: string;
  /** 支持的提供商 */
  providers: AIProvider[];
  /** 模型配置列表 */
  modelConfigs: AIModelConfig[];
  /** 默认配置 ID */
  defaultConfigId: string;
  /** 全局设置 */
  globalSettings: GlobalAISettings;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 全局 AI 设置
 */
export interface GlobalAISettings {
  /** 是否启用 AI 功能 */
  enabled: boolean;
  /** 默认语言 */
  defaultLanguage: string;
  /** 是否保存对话历史 */
  saveHistory: boolean;
  /** 历史记录最大条数 */
  maxHistorySize: number;
  /** 是否启用自动重试 */
  autoRetry: boolean;
  /** 最大并发请求数 */
  maxConcurrentRequests: number;
  /** 请求速率限制（每分钟） */
  rateLimit: number;
  /** 是否启用调试模式 */
  debugMode: boolean;
  /** 日志级别 */
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * 预定义的常见 AI 提供商
 */
export const AI_PROVIDERS: Record<string, AIProvider> = {
  OPENAI: {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI GPT 模型',
    website: 'https://openai.com',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.openai.com/v1',
    supportedModels: [
      {
        id: 'gpt-4o',
        name: 'GPT-4O',
        description: 'OpenAI 最新的多模态模型',
        contextLength: 128000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: true,
        pricing: { input: 0.005, output: 0.015, currency: 'USD' },
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'GPT-4 的优化版本',
        contextLength: 128000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: true,
        pricing: { input: 0.01, output: 0.03, currency: 'USD' },
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: '快速且经济的 GPT 模型',
        contextLength: 16385,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: false,
        pricing: { input: 0.001, output: 0.002, currency: 'USD' },
      },
    ],
  },
  ANTHROPIC: {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Anthropic Claude 模型',
    website: 'https://anthropic.com',
    requiresApiKey: true,
    defaultEndpoint: 'https://api.anthropic.com/v1',
    supportedModels: [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Anthropic 最强大的模型',
        contextLength: 200000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: true,
        pricing: { input: 0.015, output: 0.075, currency: 'USD' },
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        description: 'Claude 3 中等性能模型',
        contextLength: 200000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: true,
        pricing: { input: 0.003, output: 0.015, currency: 'USD' },
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Claude 3 快速模型',
        contextLength: 200000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: true,
        pricing: { input: 0.00025, output: 0.00125, currency: 'USD' },
      },
    ],
  },
  GOOGLE: {
    id: 'google',
    name: 'Google',
    description: 'Google Gemini 模型',
    website: 'https://ai.google.dev',
    requiresApiKey: true,
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    supportedModels: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Google 的专业级 AI 模型',
        contextLength: 32768,
        maxOutputTokens: 8192,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: false,
        pricing: { input: 0.0005, output: 0.0015, currency: 'USD' },
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: 'Google 的多模态 AI 模型',
        contextLength: 16384,
        maxOutputTokens: 2048,
        supportsStreaming: true,
        supportsFunctionCalling: false,
        supportsVision: true,
        pricing: { input: 0.0005, output: 0.0015, currency: 'USD' },
      },
    ],
  },
  AZURE: {
    id: 'azure',
    name: 'Azure OpenAI',
    description: 'Microsoft Azure OpenAI 服务',
    website:
      'https://azure.microsoft.com/services/cognitive-services/openai-service',
    requiresApiKey: true,
    defaultEndpoint: 'https://{resource-name}.openai.azure.com',
    supportedModels: [
      {
        id: 'gpt-4',
        name: 'GPT-4 (Azure)',
        description: 'Azure 部署的 GPT-4',
        contextLength: 8192,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: false,
      },
      {
        id: 'gpt-35-turbo',
        name: 'GPT-3.5 Turbo (Azure)',
        description: 'Azure 部署的 GPT-3.5 Turbo',
        contextLength: 16385,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: false,
      },
    ],
  },
  LOCAL: {
    id: 'local',
    name: '本地模型',
    description: '本地部署的 AI 模型',
    requiresApiKey: false,
    defaultEndpoint: 'http://localhost:11434',
    supportedModels: [
      {
        id: 'llama2',
        name: 'Llama 2',
        description: 'Meta 的开源 LLM',
        contextLength: 4096,
        maxOutputTokens: 2048,
        supportsStreaming: true,
        supportsFunctionCalling: false,
        supportsVision: false,
      },
      {
        id: 'codellama',
        name: 'Code Llama',
        description: '专门用于代码生成的模型',
        contextLength: 16384,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsFunctionCalling: false,
        supportsVision: false,
      },
    ],
  },
};

/**
 * 默认 AI 模型参数
 */
export const DEFAULT_AI_PARAMETERS: AIModelParameters = {
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stream: true,
};

/**
 * 默认全局设置
 */
export const DEFAULT_GLOBAL_SETTINGS: GlobalAISettings = {
  enabled: true,
  defaultLanguage: 'zh-CN',
  saveHistory: true,
  maxHistorySize: 100,
  autoRetry: true,
  maxConcurrentRequests: 3,
  rateLimit: 60,
  debugMode: false,
  logLevel: 'info',
};
