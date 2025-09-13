module.exports = {
  // 继承标准配置
  extends: [
    'stylelint-config-standard'
  ],

  // 自定义规则
  rules: {
    // 缩进
    'indentation': 2,
    
    // 字符串引号
    'string-quotes': 'single',
    
    // 颜色值
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'color-no-invalid-hex': true,
    
    // 字体
    'font-family-no-duplicate-names': true,
    'font-family-no-missing-generic-family-keyword': true,
    
    // 函数
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'function-url-quotes': 'always',
    
    // 数字
    'number-leading-zero': 'always',
    'number-no-trailing-zeros': true,
    
    // 长度单位
    'length-zero-no-unit': true,
    
    // 时间单位
    'time-min-milliseconds': 100,
    
    // 单位
    'unit-case': 'lower',
    'unit-no-unknown': true,
    
    // 值
    'value-keyword-case': 'lower',
    'value-list-comma-newline-after': 'always-multi-line',
    'value-list-comma-space-after': 'always-single-line',
    'value-list-comma-space-before': 'never',
    
    // 属性
    'property-case': 'lower',
    'property-no-unknown': true,
    
    // 键值对
    'keyframe-declaration-no-important': true,
    
    // 声明
    'declaration-bang-space-after': 'never',
    'declaration-bang-space-before': 'always',
    'declaration-colon-space-after': 'always-single-line',
    'declaration-colon-space-before': 'never',
    'declaration-no-important': null, // 允许 !important
    
    // 声明块
    'declaration-block-no-duplicate-properties': [
      true,
      {
        ignore: ['consecutive-duplicates-with-different-values']
      }
    ],
    'declaration-block-no-shorthand-property-overrides': true,
    'declaration-block-semicolon-newline-after': 'always-multi-line',
    'declaration-block-semicolon-space-after': 'always-single-line',
    'declaration-block-semicolon-space-before': 'never',
    'declaration-block-single-line-max-declarations': 1,
    'declaration-block-trailing-semicolon': 'always',
    
    // 块
    'block-closing-brace-empty-line-before': 'never',
    'block-closing-brace-newline-after': 'always',
    'block-closing-brace-newline-before': 'always-multi-line',
    'block-closing-brace-space-before': 'always-single-line',
    'block-no-empty': true,
    'block-opening-brace-newline-after': 'always-multi-line',
    'block-opening-brace-space-after': 'always-single-line',
    'block-opening-brace-space-before': 'always',
    
    // 选择器
    'selector-attribute-brackets-space-inside': 'never',
    'selector-attribute-operator-space-after': 'never',
    'selector-attribute-operator-space-before': 'never',
    'selector-combinator-space-after': 'always',
    'selector-combinator-space-before': 'always',
    'selector-descendant-combinator-no-non-space': true,
    'selector-max-empty-lines': 0,
    'selector-pseudo-class-case': 'lower',
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-class-parentheses-space-inside': 'never',
    'selector-pseudo-element-case': 'lower',
    'selector-pseudo-element-colon-notation': 'double',
    'selector-pseudo-element-no-unknown': true,
    'selector-type-case': 'lower',
    'selector-type-no-unknown': true,
    
    // 选择器列表
    'selector-list-comma-newline-after': 'always',
    'selector-list-comma-space-before': 'never',
    
    // 规则
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment']
      }
    ],
    
    // 媒体查询
    'media-feature-colon-space-after': 'always',
    'media-feature-colon-space-before': 'never',
    'media-feature-name-case': 'lower',
    'media-feature-name-no-unknown': true,
    'media-feature-parentheses-space-inside': 'never',
    'media-feature-range-operator-space-after': 'always',
    'media-feature-range-operator-space-before': 'always',
    
    // 媒体查询列表
    'media-query-list-comma-newline-after': 'always-multi-line',
    'media-query-list-comma-space-after': 'always-single-line',
    'media-query-list-comma-space-before': 'never',
    
    // At 规则
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['blockless-after-same-name-blockless', 'first-nested'],
        ignore: ['after-comment']
      }
    ],
    'at-rule-name-case': 'lower',
    'at-rule-name-space-after': 'always-single-line',
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'mixin',
          'include',
          'content',
          'if',
          'else',
          'for',
          'each',
          'while',
          'function',
          'return'
        ]
      }
    ],
    'at-rule-semicolon-newline-after': 'always',
    
    // 注释
    'comment-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['stylelint-commands']
      }
    ],
    'comment-whitespace-inside': 'always',
    
    // 一般性
    'max-empty-lines': 1,
    'no-duplicate-selectors': true,
    'no-eol-whitespace': true,
    'no-extra-semicolons': true,
    'no-invalid-double-slash-comments': true,
    'no-missing-end-of-source-newline': true,
    
    // 禁用某些规则以适配 Less/SCSS
    'scss/at-rule-no-unknown': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer'
        ]
      }
    ]
  },
  
  // 忽略文件
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**'
  ],
  
  // 针对不同文件类型的覆盖配置
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['*.scss', '**/*.scss'],
      customSyntax: 'postcss-scss'
    },
    {
      files: ['*.less', '**/*.less'],
      customSyntax: 'postcss-less'
    }
  ]
}
