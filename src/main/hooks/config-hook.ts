import { promises as fs } from 'fs';
import path from 'path';
import { app, ipcMain } from 'electron';
import { JSONFilePreset } from 'lowdb/node';
import {
  AIConfig,
  AIModelConfig,
  AI_PROVIDERS,
  DEFAULT_AI_PARAMETERS,
  DEFAULT_GLOBAL_SETTINGS,
} from '../../../customTypes/models/config.types';

/**
 * AI配置文件路径
 */
const CONFIG_FILE_NAME = 'ai-config.json';
const CONFIG_DIR = app.getPath('userData');
const CONFIG_FILE_PATH = path.join(CONFIG_DIR, CONFIG_FILE_NAME);

/**
 * 默认AI配置
 */
const DEFAULT_AI_CONFIG: AIConfig = {
  version: '1.0.0',
  name: 'AI配置',
  description: 'kxin-note AI助手配置',
  providers: Object.values(AI_PROVIDERS),
  modelConfigs: [],
  defaultConfigId: '',
  globalSettings: DEFAULT_GLOBAL_SETTINGS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 配置数据库实例
 */
let configDb: any = null;

/**
 * 初始化配置数据库
 */
async function initializeConfigDb(): Promise<void> {
  try {
    // 确保配置目录存在
    await fs.mkdir(CONFIG_DIR, { recursive: true });

    // 初始化数据库
    configDb = await JSONFilePreset(CONFIG_FILE_PATH, DEFAULT_AI_CONFIG);

    console.log('AI配置数据库初始化成功:', CONFIG_FILE_PATH);
  } catch (error) {
    console.error('初始化AI配置数据库失败:', error);
    throw error;
  }
}

/**
 * 获取完整的AI配置
 */
export async function getAIConfig(): Promise<AIConfig> {
  try {
    if (!configDb) {
      await initializeConfigDb();
    }

    await configDb.read();
    return configDb.data as AIConfig;
  } catch (error) {
    console.error('获取AI配置失败:', error);
    throw error;
  }
}

/**
 * 设置完整的AI配置
 */
export async function setAIConfig(config: AIConfig): Promise<void> {
  try {
    if (!configDb) {
      await initializeConfigDb();
    }
    // 更新时间戳
    config.updatedAt = new Date().toISOString();
    // 写入配置
    configDb.data = config;
    console.log('configDb.data', configDb.data);
    await configDb.write();
    console.log('AI配置保存成功');
  } catch (error) {
    console.error('保存AI配置失败:', error);
    throw error;
  }
}

/**
 * 获取特定的模型配置
 */
export async function getModelConfig(
  configId: string
): Promise<AIModelConfig | null> {
  try {
    const config = await getAIConfig();
    return config.modelConfigs.find(mc => mc.id === configId) || null;
  } catch (error) {
    console.error('获取模型配置失败:', error);
    throw error;
  }
}

/**
 * 添加或更新模型配置
 */
export async function setModelConfig(
  modelConfig: AIModelConfig
): Promise<void> {
  try {
    const config = await getAIConfig();
    const existingIndex = config.modelConfigs.findIndex(
      mc => mc.id === modelConfig.id
    );

    // 更新时间戳
    modelConfig.updatedAt = new Date().toISOString();
    if (!modelConfig.createdAt) {
      modelConfig.createdAt = modelConfig.updatedAt;
    }

    if (existingIndex >= 0) {
      // 更新现有配置
      config.modelConfigs[existingIndex] = modelConfig;
    } else {
      // 添加新配置
      config.modelConfigs.push(modelConfig);
    }

    // 如果这是第一个配置或者设置为默认，更新默认配置ID
    if (modelConfig.isDefault || !config.defaultConfigId) {
      // 取消其他配置的默认状态
      config.modelConfigs.forEach(mc => {
        if (mc.id !== modelConfig.id) {
          mc.isDefault = false;
        }
      });
      config.defaultConfigId = modelConfig.id;
    }

    await setAIConfig(config);
  } catch (error) {
    console.error('保存模型配置失败:', error);
    throw error;
  }
}

/**
 * 删除模型配置
 */
export async function deleteModelConfig(configId: string): Promise<void> {
  try {
    const config = await getAIConfig();
    const configIndex = config.modelConfigs.findIndex(mc => mc.id === configId);

    if (configIndex < 0) {
      throw new Error(`模型配置不存在: ${configId}`);
    }

    const isDefault = config.modelConfigs[configIndex].isDefault;
    config.modelConfigs.splice(configIndex, 1);

    // 如果删除的是默认配置，设置新的默认配置
    if (isDefault && config.modelConfigs.length > 0) {
      config.modelConfigs[0].isDefault = true;
      config.defaultConfigId = config.modelConfigs[0].id;
    } else if (config.modelConfigs.length === 0) {
      config.defaultConfigId = '';
    }

    await setAIConfig(config);
  } catch (error) {
    console.error('删除模型配置失败:', error);
    throw error;
  }
}

/**
 * 获取默认模型配置
 */
export async function getDefaultModelConfig(): Promise<AIModelConfig | null> {
  try {
    const config = await getAIConfig();
    return (
      config.modelConfigs.find(mc => mc.isDefault) ||
      (config.modelConfigs.length > 0 ? config.modelConfigs[0] : null)
    );
  } catch (error) {
    console.error('获取默认模型配置失败:', error);
    throw error;
  }
}

/**
 * 设置默认模型配置
 */
export async function setDefaultModelConfig(configId: string): Promise<void> {
  try {
    const config = await getAIConfig();
    const targetConfig = config.modelConfigs.find(mc => mc.id === configId);

    if (!targetConfig) {
      throw new Error(`模型配置不存在: ${configId}`);
    }

    // 取消所有配置的默认状态
    config.modelConfigs.forEach(mc => {
      mc.isDefault = false;
    });

    // 设置新的默认配置
    targetConfig.isDefault = true;
    config.defaultConfigId = configId;

    await setAIConfig(config);
  } catch (error) {
    console.error('设置默认模型配置失败:', error);
    throw error;
  }
}

/**
 * 创建示例模型配置
 */
export function createSampleModelConfig(): AIModelConfig {
  const now = new Date().toISOString();
  return {
    id: `config_${Date.now()}`,
    name: '示例配置',
    enabled: true,
    isDefault: false,
    providerId: 'openai',
    modelId: 'gpt-3.5-turbo',
    apiKey: '',
    endpoint: AI_PROVIDERS.OPENAI.defaultEndpoint,
    parameters: { ...DEFAULT_AI_PARAMETERS },
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 验证模型配置
 */
export function validateModelConfig(config: AIModelConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.id) errors.push('配置ID不能为空');
  if (!config.name) errors.push('配置名称不能为空');
  if (!config.providerId) errors.push('提供商ID不能为空');
  if (!config.modelId) errors.push('模型ID不能为空');
  if (!config.endpoint) errors.push('API端点不能为空');

  // 验证提供商是否存在
  const provider = AI_PROVIDERS[config.providerId.toUpperCase()];
  if (!provider) {
    errors.push('不支持的提供商');
  } else {
    // 验证模型是否存在
    const model = provider.supportedModels.find(m => m.id === config.modelId);
    if (!model) {
      errors.push('不支持的模型');
    }

    // 验证API Key
    if (provider.requiresApiKey && !config.apiKey) {
      errors.push('该提供商需要API Key');
    }
  }

  // 验证参数
  if (config.parameters) {
    if (
      config.parameters.temperature < 0 ||
      config.parameters.temperature > 2
    ) {
      errors.push('温度参数必须在0-2之间');
    }
    if (config.parameters.topP < 0 || config.parameters.topP > 1) {
      errors.push('Top-p参数必须在0-1之间');
    }
    if (config.parameters.maxTokens <= 0) {
      errors.push('最大tokens必须大于0');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 注册IPC事件处理
 */
export function registerAIConfigIpcHandlers(): void {
  // 获取完整配置
  ipcMain.handle('ai-config:get', async () => {
    return await getAIConfig();
  });

  // 设置完整配置
  ipcMain.handle('ai-config:set', async (_, config: AIConfig) => {
    await setAIConfig(config);
  });

  // 获取模型配置
  ipcMain.handle('ai-config:get-model', async (_, configId: string) => {
    return await getModelConfig(configId);
  });

  // 设置模型配置
  ipcMain.handle(
    'ai-config:set-model',
    async (_, modelConfig: AIModelConfig) => {
      await setModelConfig(modelConfig);
    }
  );

  // 删除模型配置
  ipcMain.handle('ai-config:delete-model', async (_, configId: string) => {
    await deleteModelConfig(configId);
  });

  // 获取默认模型配置
  ipcMain.handle('ai-config:get-default', async () => {
    return await getDefaultModelConfig();
  });

  // 设置默认模型配置
  ipcMain.handle('ai-config:set-default', async (_, configId: string) => {
    await setDefaultModelConfig(configId);
  });

  // 创建示例配置
  ipcMain.handle('ai-config:create-sample', () => {
    return createSampleModelConfig();
  });

  // 验证配置
  ipcMain.handle('ai-config:validate', (_, config: AIModelConfig) => {
    return validateModelConfig(config);
  });

  // 获取支持的提供商
  ipcMain.handle('ai-config:get-providers', () => {
    return Object.values(AI_PROVIDERS);
  });

  console.log('AI配置IPC事件处理器注册完成');
}

/**
 * 初始化AI配置管理
 */
export async function initializeAIConfig(): Promise<void> {
  try {
    await initializeConfigDb();
    registerAIConfigIpcHandlers();
    console.log('AI配置管理初始化完成');
  } catch (error) {
    console.error('AI配置管理初始化失败:', error);
    throw error;
  }
}
