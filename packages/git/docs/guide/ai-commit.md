# AI 提交信息

根据暂存区变更自动生成提交主题与正文，支持自定义校验规则与格式化。

- 能力：
- 扫描变更、识别类型/范围、统计增删行与变更分布
- 生成符合 Conventional Commits 的消息（可选 Emoji）
- 自定义验证器（长度、格式、敏感词）

- 交互式使用：
- lgit interactive → 智能提交

- 编程式使用：
- import { SmartCommit } from '@ldesign/git/core/SmartCommit'
- const sm = new SmartCommit(git)
- await sm.commit({ interactive: true })

- 校验失败时会给出可读的提示，可在配置中关闭或自定义规则。
