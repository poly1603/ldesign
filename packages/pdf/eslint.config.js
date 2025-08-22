/**
 * ESLint配置文件
 * 为PDF预览组件包提供严格的代码规范检查
 */

import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        Worker: 'readonly',
        OffscreenCanvas: 'readonly',
        HTMLCanvasElement: 'readonly',
        CanvasRenderingContext2D: 'readonly',
        ArrayBuffer: 'readonly',
        Uint8Array: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
    plugins: {\n      '@typescript-eslint': typescript,\n    },\n    rules: {\n      // TypeScript 严格规则\n      '@typescript-eslint/no-explicit-any': 'error',\n      '@typescript-eslint/no-unsafe-any': 'error',\n      '@typescript-eslint/no-unsafe-assignment': 'error',\n      '@typescript-eslint/no-unsafe-call': 'error',\n      '@typescript-eslint/no-unsafe-member-access': 'error',\n      '@typescript-eslint/no-unsafe-return': 'error',\n      '@typescript-eslint/explicit-function-return-type': 'error',\n      '@typescript-eslint/explicit-module-boundary-types': 'error',\n      '@typescript-eslint/no-unused-vars': 'error',\n      '@typescript-eslint/prefer-readonly': 'error',\n      '@typescript-eslint/strict-boolean-expressions': 'error',\n      '@typescript-eslint/no-floating-promises': 'error',\n      '@typescript-eslint/await-thenable': 'error',\n      '@typescript-eslint/no-misused-promises': 'error',\n      '@typescript-eslint/require-await': 'error',\n      '@typescript-eslint/return-await': 'error',\n      '@typescript-eslint/prefer-nullish-coalescing': 'error',\n      '@typescript-eslint/prefer-optional-chain': 'error',\n      '@typescript-eslint/prefer-as-const': 'error',\n      '@typescript-eslint/no-unnecessary-type-assertion': 'error',\n      '@typescript-eslint/no-non-null-assertion': 'error',\n\n      // 禁止使用危险类型\n      '@typescript-eslint/ban-types': [\n        'error',\n        {\n          types: {\n            'Function': {\n              message: 'Use specific function type instead of Function',\n              fixWith: '(...args: unknown[]) => unknown',\n            },\n            '{}': {\n              message: 'Use Record<string, unknown> instead of {}',\n              fixWith: 'Record<string, unknown>',\n            },\n            'object': {\n              message: 'Use Record<string, unknown> instead of object',\n              fixWith: 'Record<string, unknown>',\n            },\n          },\n        },\n      ],\n\n      // 控制台使用规则\n      'no-console': [\n        'error',\n        {\n          allow: ['warn', 'error', 'info'],\n        },\n      ],\n\n      // 代码质量规则\n      'prefer-const': 'error',\n      'no-var': 'error',\n      'eqeqeq': ['error', 'always'],\n      'curly': ['error', 'all'],\n      'no-throw-literal': 'error',\n      'prefer-promise-reject-errors': 'error',\n      'no-await-in-loop': 'warn',\n      'require-atomic-updates': 'error',\n\n      // 安全相关\n      'no-eval': 'error',\n      'no-implied-eval': 'error',\n      'no-new-func': 'error',\n      'no-script-url': 'error',\n\n      // 代码风格\n      'indent': ['error', 2],\n      'quotes': ['error', 'single', { avoidEscape: true }],\n      'semi': ['error', 'never'],\n      'comma-dangle': ['error', 'always-multiline'],\n      'object-curly-spacing': ['error', 'always'],\n      'array-bracket-spacing': ['error', 'never'],\n      'space-before-function-paren': ['error', 'never'],\n      'keyword-spacing': 'error',\n      'space-infix-ops': 'error',\n      'eol-last': 'error',\n      'no-trailing-spaces': 'error',\n      'max-len': [\n        'error',\n        {\n          code: 120,\n          ignoreUrls: true,\n          ignoreStrings: true,\n          ignoreTemplateLiterals: true,\n          ignoreComments: true,\n        },\n      ],\n\n      // 导入规则\n      'sort-imports': [\n        'error',\n        {\n          ignoreCase: true,\n          ignoreDeclarationSort: true,\n          ignoreMemberSort: false,\n        },\n      ],\n    },\n  },\n\n  // 测试文件特殊规则\n  {\n    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts'],\n    rules: {\n      '@typescript-eslint/no-explicit-any': 'off',\n      '@typescript-eslint/no-unsafe-any': 'off',\n      '@typescript-eslint/no-unsafe-assignment': 'off',\n      '@typescript-eslint/no-unsafe-call': 'off',\n      '@typescript-eslint/no-unsafe-member-access': 'off',\n      '@typescript-eslint/no-non-null-assertion': 'off',\n      'no-console': 'off',\n    },\n  },\n\n  // Worker文件特殊规则\n  {\n    files: ['**/*.worker.ts'],\n    languageOptions: {\n      globals: {\n        self: 'readonly',\n        importScripts: 'readonly',\n        postMessage: 'readonly',\n        addEventListener: 'readonly',\n        removeEventListener: 'readonly',\n      },\n    },\n    rules: {\n      'no-restricted-globals': [\n        'error',\n        {\n          name: 'window',\n          message: 'Use self instead of window in worker context',\n        },\n        {\n          name: 'document',\n          message: 'document is not available in worker context',\n        },\n      ],\n    },\n  },\n\n  // 示例文件规则放宽\n  {\n    files: ['examples/**/*.ts', 'examples/**/*.js', 'docs/**/*.ts'],\n    rules: {\n      '@typescript-eslint/no-explicit-any': 'warn',\n      '@typescript-eslint/explicit-function-return-type': 'off',\n      'no-console': 'off',\n    },\n  },\n]