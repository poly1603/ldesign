# 钩子模板与管理

提供常用 Git Hook 模板（pre-commit、commit-msg 等），并支持一键启用/禁用与自定义脚本。

- 预置模板：
- lint-staged、eslint 检查、prettier 格式化、测试、敏感信息扫描、大文件检查等
- commit-msg 规范校验（Conventional Commits）与 Emoji 前缀

- 启用方式：
- lgit interactive → 钩子管理

- 模板说明：
- 模板以脚本字符串形式存放，可按需生成到 .git/hooks 下（注意在 Windows 下的可执行权限）

- 提示：
- pre-commit 失败会阻止提交；请先在本地完成修复或按需跳过（--no-verify）。
