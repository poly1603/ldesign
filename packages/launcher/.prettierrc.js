module.exports = {
  // 基础配置
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // JSX 配置
  jsxSingleQuote: false,
  
  // 尾随逗号
  trailingComma: 'none',
  
  // 括号空格
  bracketSpacing: true,
  bracketSameLine: false,
  
  // 箭头函数参数括号
  arrowParens: 'avoid',
  
  // 范围格式化
  rangeStart: 0,
  rangeEnd: Infinity,
  
  // 特殊文件处理
  proseWrap: 'preserve',
  
  // HTML 空格敏感度
  htmlWhitespaceSensitivity: 'css',
  
  // Vue 文件 script 和 style 标签缩进
  vueIndentScriptAndStyle: false,
  
  // 换行符
  endOfLine: 'lf',
  
  // 嵌入语言格式化
  embeddedLanguageFormatting: 'auto',
  
  // 单个属性的HTML标签保持同一行
  singleAttributePerLine: false,
  
  // 覆盖特定文件的配置
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always'
      }
    },
    {
      files: '*.json',
      options: {
        printWidth: 80
      }
    }
  ]
}
