/**
 * Commitlint 配置
 * 
 * 提交信息格式规范：
 * <type>(<scope>): <subject>
 * 
 * 示例：
 * feat(router): add new navigation method
 * fix(cache): resolve memory leak issue
 * docs(readme): update installation guide
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复bug
        'docs',     // 文档更新
        'style',    // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不是新增功能，也不是修改bug的代码变动）
        'perf',     // 性能优化
        'test',     // 增加测试
        'chore',    // 构建过程或辅助工具的变动
        'ci',       // CI配置文件和脚本的变动
        'build',    // 影响构建系统或外部依赖的更改
        'revert',   // 回滚
      ],
    ],
    // 主题不能为空
    'subject-empty': [2, 'never'],
    // 主题不能以句号结尾
    'subject-full-stop': [2, 'never', '.'],
    // 主题格式
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 类型格式
    'type-case': [2, 'always', 'lower-case'],
    // 范围格式
    'scope-case': [2, 'always', 'lower-case'],
    // 头部最大长度
    'header-max-length': [2, 'always', 100],
    // 主体前必须有空行
    'body-leading-blank': [1, 'always'],
    // 脚注前必须有空行
    'footer-leading-blank': [1, 'always'],
  },
}
