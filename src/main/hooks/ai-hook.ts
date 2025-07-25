import OpenAI from 'openai';
import { ipcMain } from 'electron';
import { getDefaultModelConfig, getModelConfig } from './config-hook';
import type { AIModelConfig } from '../../../customTypes/models/config.types';

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
 * AI 流式响应接口
 */
export interface AIChatStreamChunk {
  content: string;
  finished: boolean;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI 客户端缓存
 */
const clientCache = new Map<string, OpenAI>();

/**
 * 清除客户端缓存
 */
function clearClientCache(): void {
  clientCache.clear();
}

/**
 * 创建 OpenAI 兼容的客户端
 * 支持 OpenAI、Azure OpenAI、DeepSeek 等兼容 OpenAI API 的提供商
 */
function createOpenAICompatibleClient(config: AIModelConfig): OpenAI {
  const clientKey = `${config.providerId}_${config.id}`;

  if (clientCache.has(clientKey)) {
    return clientCache.get(clientKey)!;
  }

  const clientConfig: any = {
    apiKey: config.apiKey,
    baseURL: config.endpoint,
    timeout: config.timeout,
    maxRetries: config.retryCount,
  };

  // OpenAI 特有配置
  if (config.providerId === 'openai') {
    if (config.organizationId) {
      clientConfig.organization = config.organizationId;
    }
    if (config.projectId) {
      clientConfig.project = config.projectId;
    }
  }

  // Azure OpenAI 特殊处理
  if (config.providerId === 'azure') {
    // Azure OpenAI 需要特殊的 API 版本
    clientConfig.defaultQuery = { 'api-version': '2024-02-15-preview' };
    clientConfig.defaultHeaders = {
      'api-key': config.apiKey,
    };
  }

  // 自定义请求头
  if (config.headers) {
    clientConfig.defaultHeaders = {
      ...clientConfig.defaultHeaders,
      ...config.headers,
    };
  }

  const client = new OpenAI(clientConfig);
  clientCache.set(clientKey, client);
  return client;
}

/**
 * 格式化消息为 OpenAI 格式
 */
function formatMessagesForOpenAI(
  messages: AIChatMessage[],
  systemPrompt?: string
): any[] {
  const formatted: any[] = [];

  if (systemPrompt) {
    formatted.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  for (const msg of messages) {
    formatted.push({
      role: msg.role,
      content: msg.content,
    });
  }

  return formatted;
}

/**
 * 使用 OpenAI 兼容的 API 进行聊天
 */
async function chatWithOpenAICompatible(
  config: AIModelConfig,
  messages: AIChatMessage[],
  systemPrompt?: string
): Promise<AIChatResponse> {
  const client = createOpenAICompatibleClient(config);
  const formattedMessages = formatMessagesForOpenAI(messages, systemPrompt);

  try {
    const response = await client.chat.completions.create({
      model: config.modelId,
      messages: formattedMessages,
      temperature: config.parameters.temperature,
      top_p: config.parameters.topP,
      max_tokens: config.parameters.maxTokens,
      frequency_penalty: config.parameters.frequencyPenalty,
      presence_penalty: config.parameters.presencePenalty,
      stop: config.parameters.stopSequences,
      stream: false,
    });

    const choice = response.choices[0];
    return {
      content: choice.message?.content || '',
      finishReason: choice.finish_reason || undefined,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
      model: response.model,
    };
  } catch (error) {
    console.error(`${config.providerId} 聊天失败:`, error);
    throw new Error(
      `${config.providerId} 聊天失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
}

/**
 * 统一的 AI 聊天接口
 */
export async function chatWithAI(
  request: AIChatRequest
): Promise<AIChatResponse> {
  let config: AIModelConfig | null;

  // 获取配置
  if (request.configId) {
    config = await getModelConfig(request.configId);
    if (!config) {
      throw new Error(`模型配置不存在: ${request.configId}`);
    }
  } else {
    config = await getDefaultModelConfig();
    if (!config) {
      throw new Error('没有可用的默认AI模型配置');
    }
  }

  if (!config.enabled) {
    throw new Error('所选择的AI模型配置已被禁用');
  }

  // 验证 API Key
  if (!config.apiKey) {
    throw new Error('AI模型配置缺少API Key');
  }

  // 获取系统提示词
  const systemPrompt = request.systemPrompt || config.parameters.systemPrompt;

  // 检查支持的提供商
  const supportedProviders = ['openai', 'azure', 'deepseek'];
  if (!supportedProviders.includes(config.providerId.toLowerCase())) {
    throw new Error(
      `暂不支持的AI提供商: ${config.providerId}。当前支持: ${supportedProviders.join(', ')}`
    );
  }

  // 执行聊天请求，包含重试逻辑
  let lastError: Error | null = null;
  const maxRetries = config.retryCount || 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`第 ${attempt} 次重试 AI 请求...`);
        await new Promise(resolve =>
          setTimeout(resolve, config.retryDelay || 1000)
        );
      }

      return await chatWithOpenAICompatible(
        config,
        request.messages,
        systemPrompt
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('未知错误');
      console.error(`AI聊天失败 (第 ${attempt + 1} 次尝试):`, lastError);

      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        break;
      }
    }
  }

  throw lastError || new Error('AI聊天失败');
}

/**
 * 测试 AI 配置连接
 */
export async function testAIConnection(configId?: string): Promise<{
  success: boolean;
  message: string;
  latency?: number;
}> {
  const startTime = Date.now();

  try {
    const testRequest: AIChatRequest = {
      messages: [
        {
          role: 'user',
          content: 'Hello, please respond with "Connection test successful"',
        },
      ],
      configId,
    };

    const response = await chatWithAI(testRequest);
    const latency = Date.now() - startTime;

    return {
      success: true,
      message: `连接测试成功，响应时间: ${latency}ms，响应: ${response.content.slice(0, 50)}...`,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
      latency,
    };
  }
}

/**
 * 获取 AI 模型信息
 */
export async function getAIModelInfo(configId?: string): Promise<{
  config: AIModelConfig;
  provider: string;
  model: string;
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
  };
}> {
  let config: AIModelConfig | null;

  if (configId) {
    config = await getModelConfig(configId);
    if (!config) {
      throw new Error(`模型配置不存在: ${configId}`);
    }
  } else {
    config = await getDefaultModelConfig();
    if (!config) {
      throw new Error('没有可用的默认AI模型配置');
    }
  }

  // 判断模型能力
  const modelId = config.modelId.toLowerCase();
  const capabilities = {
    streaming: config.parameters.stream,
    functionCalling:
      modelId.includes('gpt-4') ||
      modelId.includes('gpt-3.5') ||
      modelId.includes('deepseek'),
    vision:
      modelId.includes('vision') ||
      modelId.includes('4o') ||
      modelId.includes('gpt-4-turbo'),
  };

  return {
    config,
    provider: config.providerId,
    model: config.modelId,
    capabilities,
  };
}

/**
 * 生成聊天标题
 * 根据第一条用户消息生成简短的标题
 */
export async function generateChatTitle(
  messages: AIChatMessage[],
  configId?: string
): Promise<string> {
  try {
    if (messages.length === 0) {
      return '新对话';
    }

    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) {
      return '新对话';
    }

    // 如果第一条消息很短，直接作为标题
    if (firstUserMessage.content.length <= 20) {
      return firstUserMessage.content;
    }

    // 使用AI生成标题
    const titleRequest: AIChatRequest = {
      messages: [
        {
          role: 'user',
          content: `请为这段对话生成一个简短的标题（不超过10个字）：\n\n${firstUserMessage.content}`,
        },
      ],
      configId,
      systemPrompt:
        '你是一个专门生成对话标题的助手。请生成简短、准确的标题，不要使用引号或其他符号包围标题。',
    };

    const response = await chatWithAI(titleRequest);
    const title = response.content.trim().replace(/^["']|["']$/g, '');

    return title.length > 20 ? title.slice(0, 20) + '...' : title;
  } catch (error) {
    console.error('生成聊天标题失败:', error);
    // 失败时使用第一条消息的前20个字符
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      return (
        firstUserMessage.content.slice(0, 20) +
        (firstUserMessage.content.length > 20 ? '...' : '')
      );
    }
    return '新对话';
  }
}

/**
 * 注册 AI 相关的 IPC 处理器
 */
export function registerAIIpcHandlers(): void {
  // AI 聊天
  ipcMain.handle('ai:chat', async (_, request: AIChatRequest) => {
    return await chatWithAI(request);
  });

  // 测试连接
  ipcMain.handle('ai:test-connection', async (_, configId?: string) => {
    return await testAIConnection(configId);
  });

  // 获取模型信息
  ipcMain.handle('ai:get-model-info', async (_, configId?: string) => {
    return await getAIModelInfo(configId);
  });

  // 生成聊天标题
  ipcMain.handle(
    'ai:generate-title',
    async (_, messages: AIChatMessage[], configId?: string) => {
      return await generateChatTitle(messages, configId);
    }
  );

  // 清除客户端缓存
  ipcMain.handle('ai:clear-cache', () => {
    clearClientCache();
    return { success: true, message: '客户端缓存已清除' };
  });

  console.log('AI IPC 事件处理器注册完成');
}

/**
 * 初始化 AI 模块
 */
export async function initializeAI(): Promise<void> {
  try {
    registerAIIpcHandlers();
    console.log('AI 模块初始化完成');
  } catch (error) {
    console.error('AI 模块初始化失败:', error);
    throw error;
  }
}
