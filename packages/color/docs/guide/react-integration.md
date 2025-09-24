# React 集成（思路）

核心能力与框架无关，可在 React 中通过 Context/Provider 封装：

- 在应用启动时创建一个 ThemeManager 实例并 init
- 通过 React Context 透出当前主题/模式与切换方法
- 在 effect 中监听系统主题变化与存储

示意代码略。您也可以直接在组件层使用导出的工具函数（颜色转换、调色板、可访问性等）。
