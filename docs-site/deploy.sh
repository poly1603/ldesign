#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
echo "正在构建文档站点..."
pnpm build

# 进入生成的文件夹
cd .vitepress/dist

# 如果是发布到自定义域名
echo 'docs.ldesign.dev' > CNAME

# 初始化 git 仓库
git init
git add -A
git commit -m 'deploy docs'

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:ldesign/ldesign.git main:gh-pages

# 如果使用 Travis CI 等持续集成工具
# git push -f https://${GITHUB_TOKEN}@github.com/ldesign/ldesign.git main:gh-pages

cd -

echo "文档部署完成！"
