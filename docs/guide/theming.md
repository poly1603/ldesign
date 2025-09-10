# 主题定制

LDesign 通过 CSS 变量提供灵活的主题定制能力，支持亮/暗色切换与品牌色定制。

## 基础变量

在全局样式中覆盖 CSS 变量即可：

```css
:root {
  /* 品牌色 */
  --ld-color-primary: #1976d2;
  --ld-color-success: #4caf50;
  --ld-color-warning: #ff9800;
  --ld-color-error:   #f44336;

  /* 字体与尺寸 */
  --ld-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --ld-font-size-base: 14px;

  /* 间距与圆角 */
  --ld-spacing-sm: 8px;
  --ld-spacing-md: 16px;
  --ld-spacing-lg: 24px;
  --ld-border-radius-base: 4px;
}
```

## 暗色模式

通过自定义属性切换成暗色主题：

```css
[data-theme="dark"] {
  --ld-color-bg-base:    #1a1a1a;
  --ld-color-text-base:  #ffffff;
  --ld-color-border-base:#333333;
}
```

```js
// 切换主题
const root = document.documentElement
root.setAttribute('data-theme', 'dark')
```

## 按需覆盖组件样式

所有组件都基于相同的设计令牌，你也可以只覆盖某个组件的变量。建议参考各组件文档尾部的「CSS 变量」章节。

## 与 @ldesign/color 协作

如需动态生成主题或进行色值计算，建议配合 `@ldesign/color`：

```ts
import { ThemeGenerator } from '@ldesign/color'

const theme = new ThemeGenerator({ primary: '#1677ff' })
const tokens = theme.generate()

// 将 tokens 写入到 :root 即可生效
```

## 相关文档

- [快速开始](./getting-started)
- [安装](./installation)
- [组件文档](/components/button)

