# API 参考

## 编程式 API

```ts
import { build, watch, analyze, init, ProjectScanner, PluginConfigurator, RollupBuilder, TypeGenerator, defineConfig } from '@ldesign/builder'
```

### build(options)
- 智能扫描、配置并执行 Rollup 构建

### watch(options)
- 启动监听模式，文件变更触发增量构建

### analyze(root?)
- 返回项目扫描结果

### init(options)
- 生成配置与示例代码

### defineConfig(config)
- 配置辅助
