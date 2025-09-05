# 微前端集成示例

展示在微前端架构（如 qiankun、Module Federation）下的接入思路。

- 将引擎实例暴露为全局能力，供主/子应用通信
- 使用事件总线跨子应用传递消息
- 在卸载钩子中清理引擎：engine.unmount(); engine.destroy?.()

