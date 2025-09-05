---
title: 静态站点部署
description: 使用 Nginx/Apache 托管 dist 静态资源的参考配置
---

# 静态站点部署

以 Nginx/Apache 为例说明静态文件部署。

## Nginx

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/app/dist;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # 静态缓存
  location ~* \.(js|css|png|jpg|svg|woff2?)$ {
    expires 7d;
    add_header Cache-Control "public, max-age=604800, immutable";
  }
}
```

## Apache

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
