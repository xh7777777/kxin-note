/**
 * 插件系统类型定义
 * Plugin System Type Definitions
 */

/**
 * 插件分类管理器
 * 用于组织和管理一组相关的插件
 */
export interface PluginCategory {
  /** 分类唯一标识符 */
  id: string;
  /** 分类显示名称 */
  name: string;
  /** 分类图标 (emoji 或 icon 类名) */
  icon?: string;
  /** 分类描述 */
  description?: string;
  /** 是否折叠显示 */
  collapsed?: boolean;
  /** 分类排序权重 */
  order?: number;
  /** 该分类下的插件列表 */
  plugins: FeaturePlugin[];
  /** 分类颜色主题 */
  color?: string;
  /** 是否为系统内置分类 */
  isBuiltIn?: boolean;
}

/**
 * 侧边栏插件项列表类型
 */
export type PluginSidebarList = PluginSidebarItem[];

/**
 * 侧边栏插件显示项
 * 用于侧边栏中显示的简化插件信息
 */
export interface PluginSidebarItem {
  /** 插件唯一标识符 */
  id: string;
  /** 插件显示名称 */
  name: string;
  /** 插件图标 (emoji 或 icon 类名) */
  icon: string;
  /** 图标类型 */
  iconType?: 'emoji' | 'icon';
  /** 是否启用该插件 */
  enabled: boolean;
  /** 显示顺序 */
  order: number;
  /** 是否为当前激活状态 */
  active?: boolean;
  /** 插件快捷键 */
  shortcut?: string;
  /** 插件描述 */
  description?: string;
}

/**
 * 功能插件完整定义
 * 包含插件的所有配置和元数据信息
 */
export interface FeaturePlugin {
  /** 插件唯一标识符 */
  id: string;
  /** 插件显示名称 */
  name: string;
  /** 插件图标 (emoji 或 icon 类名) */
  icon?: string;
  /** 图标类型：emoji 表情符号 或 icon 图标类名 */
  iconType?: 'emoji' | 'icon';
  /** 插件封面图片 URL */
  cover?: string;
  /** 插件功能描述 */
  description?: string;
  /** 是否启用该插件 */
  enabled: boolean;
  /** 是否为当前激活状态 */
  active?: boolean;
  /** 插件状态徽章 */
  badge?: PluginBadge;
  /** 插件配置参数 */
  config?: Record<string, any>;
  /** 插件显示顺序 */
  order?: number;
  /** 所属分类 ID */
  categoryId?: string;
  /** 插件元数据信息 */
  metadata: PluginMetadata;
  /** 插件权限要求 */
  permissions?: PluginPermission[];
  /** 插件快捷键 */
  shortcut?: string;
  /** 插件主题色 */
  themeColor?: string;
  /** 点击回调函数 */
  onClick?: () => void;
  /** 插件加载状态 */
  loadingState?: 'idle' | 'loading' | 'loaded' | 'error';
  /** 错误信息 */
  error?: string;
}

/**
 * 插件徽章配置
 * 用于显示插件的特殊状态标识
 */
export interface PluginBadge {
  /** 徽章显示文本 */
  text: string;
  /** 徽章类型 */
  type: 'new' | 'beta' | 'pro' | 'hot' | 'deprecated' | 'premium';
  /** 自定义徽章颜色 */
  color?: string;
  /** 徽章背景色 */
  backgroundColor?: string;
  /** 是否闪烁显示 */
  animated?: boolean;
}

/**
 * 插件元数据信息
 * 包含插件的详细信息和版本管理
 */
export interface PluginMetadata {
  /** 插件唯一标识符 */
  id: string;
  /** 插件作者 */
  author: string;
  /** 插件版本号 */
  version: string;
  /** 详细描述 */
  description: string;
  /** 插件封面图片 URL */
  cover: string;
  /** 插件图标 */
  icon: string;
  /** 图标类型 */
  iconType?: 'emoji' | 'icon';
  /** 是否启用 */
  enabled: boolean;
  /** 插件主页 URL */
  homepage?: string;
  /** 插件仓库 URL */
  repository?: string;
  /** 插件许可证 */
  license?: string;
  /** 支持的平台 */
  platforms?: ('web' | 'desktop' | 'mobile')[];
  /** 最小支持版本 */
  minVersion?: string;
  /** 最大支持版本 */
  maxVersion?: string;
  /** 插件依赖 */
  dependencies?: PluginDependency[];
  /** 创建时间 */
  createdAt?: Date;
  /** 更新时间 */
  updatedAt?: Date;
  /** 插件大小 (字节) */
  size?: number;
  /** 下载次数 */
  downloadCount?: number;
  /** 评分 (1-5) */
  rating?: number;
  /** 标签 */
  tags?: string[];
}

/**
 * 插件依赖关系
 */
export interface PluginDependency {
  /** 依赖插件 ID */
  pluginId: string;
  /** 依赖版本要求 */
  version: string;
  /** 是否为可选依赖 */
  optional?: boolean;
}

/**
 * 插件权限定义
 */
export interface PluginPermission {
  /** 权限类型 */
  type:
    | 'filesystem'
    | 'network'
    | 'system'
    | 'clipboard'
    | 'notification'
    | 'camera'
    | 'microphone';
  /** 权限描述 */
  description: string;
  /** 是否为必需权限 */
  required?: boolean;
  /** 权限级别 */
  level?: 'read' | 'write' | 'execute';
}

/**
 * 插件管理器配置
 */
export interface PluginManagerConfig {
  /** 是否启用自动更新 */
  autoUpdate?: boolean;
  /** 插件存储路径 */
  storePath?: string;
  /** 最大并发加载数 */
  maxConcurrentLoads?: number;
  /** 插件超时时间 (毫秒) */
  timeout?: number;
  /** 是否启用开发者模式 */
  devMode?: boolean;
  /** 允许的插件来源 */
  allowedSources?: string[];
}

/**
 * 插件状态枚举
 */
export enum PluginStatus {
  /** 未安装 */
  NOT_INSTALLED = 'not_installed',
  /** 已安装但未启用 */
  INSTALLED = 'installed',
  /** 已启用 */
  ENABLED = 'enabled',
  /** 正在加载 */
  LOADING = 'loading',
  /** 运行中 */
  RUNNING = 'running',
  /** 已停止 */
  STOPPED = 'stopped',
  /** 错误状态 */
  ERROR = 'error',
  /** 需要更新 */
  UPDATE_AVAILABLE = 'update_available',
}

/**
 * 插件事件类型
 */
export interface PluginEvents {
  /** 插件安装事件 */
  'plugin:install': { plugin: FeaturePlugin };
  /** 插件卸载事件 */
  'plugin:uninstall': { pluginId: string };
  /** 插件启用事件 */
  'plugin:enable': { pluginId: string };
  /** 插件禁用事件 */
  'plugin:disable': { pluginId: string };
  /** 插件加载事件 */
  'plugin:load': { pluginId: string };
  /** 插件卸载事件 */
  'plugin:unload': { pluginId: string };
  /** 插件错误事件 */
  'plugin:error': { pluginId: string; error: Error };
  /** 插件更新事件 */
  'plugin:update': { pluginId: string; oldVersion: string; newVersion: string };
}
