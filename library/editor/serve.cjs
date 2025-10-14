/**
 * 简单的HTTP服务器 - 用于本地测试
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 配置
const PORT = 8000;
const ROOT_DIR = __dirname;

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.ts': 'text/plain',
  '.tsx': 'text/plain'
};

// 创建服务器
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // 解析URL
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);
  
  // 处理根路径
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // 构建文件路径
  const filePath = path.join(ROOT_DIR, pathname);
  
  // 安全检查：确保访问的文件在根目录内
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }
  
  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // 文件不存在
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    // 如果是目录，尝试加载index.html
    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (err, indexStats) => {
        if (!err && indexStats.isFile()) {
          serveFile(indexPath, res);
        } else {
          // 列出目录内容
          listDirectory(filePath, pathname, res);
        }
      });
    } else if (stats.isFile()) {
      // 提供文件
      serveFile(filePath, res);
    }
  });
});

// 提供文件
function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  // 设置CORS头部（开发环境）
  const headers = {
    'Content-Type': mimeType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  // 对JS模块特殊处理
  if (ext === '.js' || ext === '.mjs' || ext === '.ts' || ext === '.tsx') {
    headers['Content-Type'] = 'application/javascript';
  }
  
  res.writeHead(200, headers);
  
  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    console.error(`Error reading file ${filePath}:`, err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  });
  
  stream.pipe(res);
}

// 列出目录内容
function listDirectory(dirPath, urlPath, res) {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>目录浏览 - ${urlPath}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 40px;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 10px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    a:hover {
      text-decoration: underline;
    }
    .folder::before {
      content: '📁';
    }
    .file::before {
      content: '📄';
    }
    .back {
      background: #f0f9ff;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>目录: ${urlPath}</h1>`;
    
    // 添加返回上级目录链接
    if (urlPath !== '/') {
      const parentPath = path.dirname(urlPath);
      html += `
    <div class="back">
      <a href="${parentPath}" class="folder">.. (返回上级)</a>
    </div>`;
    }
    
    html += '<ul>';
    
    // 分类文件和目录
    const dirs = [];
    const normalFiles = [];
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);
      const fileUrl = path.join(urlPath, file).replace(/\\/g, '/');
      
      if (stats.isDirectory()) {
        dirs.push({ name: file, url: fileUrl });
      } else {
        normalFiles.push({ name: file, url: fileUrl });
      }
    });
    
    // 先显示目录
    dirs.sort((a, b) => a.name.localeCompare(b.name));
    dirs.forEach(dir => {
      html += `<li><a href="${dir.url}" class="folder">${dir.name}/</a></li>`;
    });
    
    // 再显示文件
    normalFiles.sort((a, b) => a.name.localeCompare(b.name));
    normalFiles.forEach(file => {
      html += `<li><a href="${file.url}" class="file">${file.name}</a></li>`;
    });
    
    html += `
    </ul>
  </div>
</body>
</html>`;
    
    res.end(html);
  });
}

// 启动服务器
server.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 HTTP服务器已启动！`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`📂 根目录: ${ROOT_DIR}`);
  console.log('========================================');
  console.log('');
  console.log('📸 测试图片右键菜单:');
  console.log(`   http://localhost:${PORT}/examples/image-menu.html`);
  console.log('');
  console.log('🧪 其他测试页面:');
  console.log(`   http://localhost:${PORT}/test/test-image-menu.html`);
  console.log(`   http://localhost:${PORT}/test/context-menu-test.html`);
  console.log('');
  console.log('按 Ctrl+C 停止服务器');
  console.log('----------------------------------------');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
  });
});

process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});