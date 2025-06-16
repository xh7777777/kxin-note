import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-plugin-prettier';

export default [
    // 基础 JavaScript 推荐配置
    js.configs.recommended,

    // 忽略的文件和目录
    {
        ignores: [
            'dist/**',
            'build/**',
            'coverage/**',
            'node_modules/**',
            '*.config.js',
            '*.config.ts',
            '.electron-vite/**',
        ],
    },

    // TypeScript 文件配置
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            prettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'no-console': 'warn',
            'no-debugger': 'error',
            'no-undef': 'off', // TypeScript 处理未定义变量检查
        },
    },

    // Vue 文件配置（渲染进程）
    {
        files: ['src/renderer/**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsparser,
                ecmaVersion: 'latest',
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
            globals: {
                // 浏览器环境全局变量
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                HTMLElement: 'readonly',
                Event: 'readonly',
                KeyboardEvent: 'readonly',
                MouseEvent: 'readonly',
                globalThis: 'readonly',
            },
        },
        plugins: {
            vue: vuePlugin,
            '@typescript-eslint': tseslint,
            prettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'vue/multi-word-component-names': 'off',
            'vue/require-default-prop': 'off',
            'no-console': 'warn',
            'no-undef': 'error',
        },
    },

    // 其他 Vue 文件配置
    {
        files: ['**/*.vue'],
        excludeFiles: ['src/renderer/**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsparser,
                ecmaVersion: 'latest',
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
        },
        plugins: {
            vue: vuePlugin,
            '@typescript-eslint': tseslint,
            prettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'vue/multi-word-component-names': 'off',
            'vue/require-default-prop': 'off',
            'no-undef': 'off',
        },
    },

    // 渲染进程 TypeScript 文件配置
    {
        files: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                // 浏览器环境全局变量
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                HTMLElement: 'readonly',
                Event: 'readonly',
                KeyboardEvent: 'readonly',
                MouseEvent: 'readonly',
                globalThis: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            prettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'no-console': 'warn',
            'no-debugger': 'error',
            'no-undef': 'error',
        },
    },

    // 主进程 Node.js 文件配置
    {
        files: ['src/main/**/*.ts', 'src/preload/**/*.ts'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                // Node.js 环境全局变量
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                process: 'readonly',
                global: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            prettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'no-console': 'off', // 主进程允许 console
            'no-undef': 'error',
        },
    },

    // 测试文件配置
    {
        files: ['tests/**/*.ts', '**/*.spec.ts', '**/*.test.ts'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                // Node.js 测试环境全局变量
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                process: 'readonly',
                global: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                // Jest/测试框架全局变量
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                jest: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            prettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'no-console': 'off', // 测试中允许 console
            'no-undef': 'error',
        },
    },
]; 