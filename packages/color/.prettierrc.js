/**
 * Prettier 配置
 * 统一代码格式化规范
 */

export default {
  // 基础配置
  semi: false, // 不使用分号
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 仅在需要时给对象属性加引号
  trailingComma: 'es5', // 在 ES5 中有效的尾随逗号

  // 缩进和空格
  tabWidth: 2, // 缩进宽度
  useTabs: false, // 使用空格而不是制表符

  // 行长度
  printWidth: 100, // 行长度限制

  // 括号和空格
  bracketSpacing: true, // 对象字面量的括号间加空格
  bracketSameLine: false, // 多行 JSX 元素的 > 放在下一行

  // 箭头函数
  arrowParens: 'avoid', // 单参数箭头函数省略括号

  // 换行符
  endOfLine: 'lf', // 使用 LF 换行符

  // Vue 文件支持
  vueIndentScriptAndStyle: false, // Vue 文件中的 script 和 style 标签不缩进

  // 嵌入式语言格式化
  embeddedLanguageFormatting: 'auto',

  // HTML 空格敏感性
  htmlWhitespaceSensitivity: 'css',

  // JSX 配置
  jsxSingleQuote: true, // JSX 中使用单引号

  // 插件配置
  plugins: [],

  // 文件覆盖配置
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.vue',
      options: {
        printWidth: 120,
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
}
