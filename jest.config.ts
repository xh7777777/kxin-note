import type { Config } from "jest";

const config: Config = {
  // 指定测试环境 - Node 环境用于主进程测试
  testEnvironment: "node",

  // 匹配测试文件
  testMatch: ["**/tests/main/**/*.spec.[jt]s", "**/tests/main/**/*.test.[jt]s"],

  // 模块转换器配置
  transform: {
    // 使用 ts-jest 处理 .ts 和 .tsx 文件
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },

  // 模块路径别名，只保留主进程相关的
  moduleNameMapper: {
    "^@main/(.*)$": "<rootDir>/src/main/$1",
    "^@config/(.*)$": "<rootDir>/config/$1",
  },

  // 支持的文件扩展名
  moduleFileExtensions: ["js", "ts", "json"],

  // 忽略转换的模块
  transformIgnorePatterns: ["/node_modules/"],

  // 测试覆盖率配置
  collectCoverageFrom: [
    "src/main/**/*.{js,ts}",
    "!src/main/**/*.d.ts",
    "!src/main/index.ts",
  ],

  // 覆盖率报告目录
  coverageDirectory: "coverage",

  // 覆盖率报告格式
  coverageReporters: ["text", "lcov", "html"],
};

export default config;
