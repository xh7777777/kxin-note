import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import {
  getAIConfig,
  setAIConfig,
  getModelConfig,
  setModelConfig,
  deleteModelConfig,
  getDefaultModelConfig,
  setDefaultModelConfig,
  createSampleModelConfig,
  validateModelConfig,
} from '../../src/main/hooks/config-hook';
import {
  AIConfig,
  AIModelConfig,
  DEFAULT_AI_PARAMETERS,
  DEFAULT_GLOBAL_SETTINGS,
  AI_PROVIDERS,
} from '../../customTypes/models/config.types';

// Mock electron
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => path.join(os.tmpdir(), 'test-app-data')),
  },
  ipcMain: {
    handle: jest.fn(),
  },
}));

describe('AI配置管理', () => {
  const testConfigDir = path.join(os.tmpdir(), 'test-app-data');
  const testConfigFile = path.join(testConfigDir, 'ai-config.json');

  beforeEach(async () => {
    // 清理测试环境
    try {
      await fs.rm(testConfigDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略删除错误
    }
  });

  afterEach(async () => {
    // 清理测试环境
    try {
      await fs.rm(testConfigDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略删除错误
    }
  });

  describe('配置文件基础操作', () => {
    test('应该能够获取默认AI配置', async () => {
      const config = await getAIConfig();

      expect(config).toBeDefined();
      expect(config.version).toBe('1.0.0');
      expect(config.name).toBe('AI配置');
      expect(config.providers).toHaveLength(Object.keys(AI_PROVIDERS).length);
      expect(config.modelConfigs).toEqual([]);
      expect(config.globalSettings).toEqual(DEFAULT_GLOBAL_SETTINGS);
    });

    test('应该能够保存和获取AI配置', async () => {
      const testConfig: AIConfig = {
        version: '1.0.0',
        name: '测试配置',
        description: '这是一个测试配置',
        providers: Object.values(AI_PROVIDERS),
        modelConfigs: [],
        defaultConfigId: '',
        globalSettings: {
          ...DEFAULT_GLOBAL_SETTINGS,
          debugMode: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setAIConfig(testConfig);
      const savedConfig = await getAIConfig();

      expect(savedConfig.name).toBe('测试配置');
      expect(savedConfig.description).toBe('这是一个测试配置');
      expect(savedConfig.globalSettings.debugMode).toBe(true);
    });
  });

  describe('模型配置操作', () => {
    test('应该能够创建示例模型配置', () => {
      const sampleConfig = createSampleModelConfig();

      expect(sampleConfig).toBeDefined();
      expect(sampleConfig.id).toMatch(/^config_\d+$/);
      expect(sampleConfig.name).toBe('示例配置');
      expect(sampleConfig.providerId).toBe('openai');
      expect(sampleConfig.modelId).toBe('gpt-3.5-turbo');
      expect(sampleConfig.parameters).toEqual(DEFAULT_AI_PARAMETERS);
    });

    test('应该能够添加模型配置', async () => {
      const modelConfig = createSampleModelConfig();
      modelConfig.name = '测试模型';
      modelConfig.isDefault = true;

      await setModelConfig(modelConfig);

      const config = await getAIConfig();
      expect(config.modelConfigs).toHaveLength(1);
      expect(config.modelConfigs[0].name).toBe('测试模型');
      expect(config.defaultConfigId).toBe(modelConfig.id);
    });

    test('应该能够获取特定模型配置', async () => {
      const modelConfig = createSampleModelConfig();
      await setModelConfig(modelConfig);

      const retrievedConfig = await getModelConfig(modelConfig.id);
      expect(retrievedConfig).toBeDefined();
      expect(retrievedConfig?.id).toBe(modelConfig.id);
      expect(retrievedConfig?.name).toBe(modelConfig.name);
    });

    test('应该能够更新模型配置', async () => {
      const modelConfig = createSampleModelConfig();
      await setModelConfig(modelConfig);

      // 更新配置
      modelConfig.name = '更新后的配置';
      modelConfig.parameters.temperature = 0.5;
      await setModelConfig(modelConfig);

      const updatedConfig = await getModelConfig(modelConfig.id);
      expect(updatedConfig?.name).toBe('更新后的配置');
      expect(updatedConfig?.parameters.temperature).toBe(0.5);
    });

    test('应该能够删除模型配置', async () => {
      const modelConfig = createSampleModelConfig();
      await setModelConfig(modelConfig);

      // 确认配置存在
      let config = await getAIConfig();
      expect(config.modelConfigs).toHaveLength(1);

      // 删除配置
      await deleteModelConfig(modelConfig.id);

      // 确认配置已删除
      config = await getAIConfig();
      expect(config.modelConfigs).toHaveLength(0);
    });

    test('删除不存在的配置应该抛出错误', async () => {
      await expect(deleteModelConfig('non-existent-id')).rejects.toThrow(
        '模型配置不存在'
      );
    });
  });

  describe('默认配置管理', () => {
    test('应该能够设置和获取默认配置', async () => {
      // 添加两个配置
      const config1 = createSampleModelConfig();
      config1.name = '配置1';
      await setModelConfig(config1);

      const config2 = createSampleModelConfig();
      config2.name = '配置2';
      await setModelConfig(config2);

      // 设置默认配置
      await setDefaultModelConfig(config2.id);

      const defaultConfig = await getDefaultModelConfig();
      expect(defaultConfig?.id).toBe(config2.id);
      expect(defaultConfig?.name).toBe('配置2');
    });

    test('第一个添加的配置应该自动成为默认配置', async () => {
      const modelConfig = createSampleModelConfig();
      await setModelConfig(modelConfig);

      const defaultConfig = await getDefaultModelConfig();
      expect(defaultConfig?.id).toBe(modelConfig.id);
    });

    test('删除默认配置后应该自动设置新的默认配置', async () => {
      // 添加两个配置
      const config1 = createSampleModelConfig();
      config1.isDefault = true;
      await setModelConfig(config1);

      const config2 = createSampleModelConfig();
      await setModelConfig(config2);

      // 删除默认配置
      await deleteModelConfig(config1.id);

      // 检查新的默认配置
      const defaultConfig = await getDefaultModelConfig();
      expect(defaultConfig?.id).toBe(config2.id);
    });
  });

  describe('配置验证', () => {
    test('应该验证有效的配置', () => {
      const validConfig = createSampleModelConfig();
      validConfig.apiKey = 'test-api-key';

      const validation = validateModelConfig(validConfig);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('应该检测缺少必填字段', () => {
      const invalidConfig = createSampleModelConfig();
      invalidConfig.name = '';
      invalidConfig.apiKey = '';

      const validation = validateModelConfig(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('配置名称不能为空');
      expect(validation.errors).toContain('该提供商需要API Key');
    });

    test('应该验证参数范围', () => {
      const invalidConfig = createSampleModelConfig();
      invalidConfig.parameters.temperature = 3.0;
      invalidConfig.parameters.topP = 1.5;
      invalidConfig.parameters.maxTokens = -1;

      const validation = validateModelConfig(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('温度参数必须在0-2之间');
      expect(validation.errors).toContain('Top-p参数必须在0-1之间');
      expect(validation.errors).toContain('最大tokens必须大于0');
    });

    test('应该验证不支持的提供商', () => {
      const invalidConfig = createSampleModelConfig();
      invalidConfig.providerId = 'unsupported-provider';

      const validation = validateModelConfig(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('不支持的提供商');
    });

    test('应该验证不支持的模型', () => {
      const invalidConfig = createSampleModelConfig();
      invalidConfig.modelId = 'unsupported-model';

      const validation = validateModelConfig(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('不支持的模型');
    });
  });

  describe('错误处理', () => {
    test('获取不存在的模型配置应该返回null', async () => {
      const config = await getModelConfig('non-existent-id');
      expect(config).toBeNull();
    });

    test('没有配置时获取默认配置应该返回null', async () => {
      const defaultConfig = await getDefaultModelConfig();
      expect(defaultConfig).toBeNull();
    });

    test('设置不存在的配置为默认应该抛出错误', async () => {
      await expect(setDefaultModelConfig('non-existent-id')).rejects.toThrow(
        '模型配置不存在'
      );
    });
  });
});
