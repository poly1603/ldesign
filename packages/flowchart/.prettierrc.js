module.exports = {
  // 基本配置
  printWidth: 100,              // 每行最大字符数
  tabWidth: 2,                  // 缩进宽度
  useTabs: false,               // 使用空格而不是制表符
  semi: false,                  // 不使用分号
  singleQuote: true,            // 使用单引号
  quoteProps: 'as-needed',      // 仅在需要时给对象属性加引号
  jsxSingleQuote: true,         // JSX 中使用单引号
  
  // 尾随逗号
  trailingComma: 'none',        // 不使用尾随逗号
  
  // 括号间距
  bracketSpacing: true,         // 对象字面量括号间加空格
  bracketSameLine: false,       // JSX 标签的 > 换行显示
  
  // 箭头函数参数括号
  arrowParens: 'avoid',         // 单参数箭头函数省略括号
  
  // 文件范围格式化
  rangeStart: 0,
  rangeEnd: Infinity,
  
  // 解析器
  parser: undefined,            // 自动推断解析器
  
  // 文件路径
  filepath: undefined,
  
  // 是否需要 pragma
  requirePragma: false,
  insertPragma: false,
  
  // 换行符
  endOfLine: 'lf',              // 使用 LF 换行符
  
  // 嵌入式语言格式化
  embeddedLanguageFormatting: 'auto',
  
  // HTML 空白敏感度
  htmlWhitespaceSensitivity: 'css',
  
  // Vue 文件脚本和样式标签缩进
  vueIndentScriptAndStyle: false,
  
  // 覆盖配置
  overrides: [
    {
      files: '*.json',
      options: {
        trailingComma: 'none'
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'preserve',
        tabWidth: 2
      }
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    },
    {
      files: '*.vue',
      options: {
        parser: 'vue',
        vueIndentScriptAndStyle: true
      }
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'typescript'
      }
    },
    {
      files: ['*.js', '*.jsx'],
      options: {
        parser: 'babel'
      }
    },
    {
      files: '*.css',
      options: {
        parser: 'css'
      }
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss'
      }
    },
    {
      files: '*.less',
      options: {
        parser: 'less',
        tabWidth: 2
      }
    }
  ]
}
