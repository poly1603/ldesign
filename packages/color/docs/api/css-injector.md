# CSS 注入器

```ts
import {
  createCSSInjector,
  CSSInjectorImpl,
  createCSSVariableGenerator,
  injectScaleVariables,
  removeAllColorVariables,
} from '@ldesign/color'
```

常用能力：

- injectVariables / injectVariablesWithComments
- injectThemeVariables(lightVars, darkVars, themeInfo)
- removeVariables()
