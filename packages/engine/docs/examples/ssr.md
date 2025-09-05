# SSR 集成示例

展示在 SSR（例如 Vite SSR / Nuxt-like）下的使用思路。

- 将引擎创建封装为工厂函数，避免跨请求共享状态
- 在 onRendered 钩子中收集日志/性能数据
- 客户端 hydration 之后再挂载插件与中间件

