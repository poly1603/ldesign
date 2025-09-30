
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');

// 配置
const SERVER_PORT = 3009;
const API_BASE = `http://localhost:${SERVER_PORT}/api/v1`;
const WS_URL = `ws://localhost:${SERVER_PORT}`;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  debug: (msg) => console.log(`${colors.gray}⚡ ${msg}${colors.reset}`)
};

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// HTTP 请求函数
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': 'test-client',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// 测试 Node 安装
async function testNodeInstall() {
  log.info('开始测试 Node.js 安装功能...\n');
  
  // 1. 启动 CLI 服务器
  log.info('启动 CLI 服务器...');
  const serverProcess = spawn('node', ['dist/index.js', 'ui'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });
  
  let serverReady = false;
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('服务器已启动') || output.includes('Server is running')) {
      serverReady = true;
    }
    log.debug(`[Server] ${output.trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    log.debug(`[Server Error] ${data.toString().trim()}`);
  });
  
  // 等待服务器启动
  let attempts = 0;
  while (!serverReady && attempts < 30) {
    await delay(1000);
    attempts++;
  }
  
  if (!serverReady) {
    log.error('服务器启动失败');
    serverProcess.kill();
    process.exit(1);
  }
  
  log.success('服务器已启动\n');
  
  try {
    // 2. 连接 WebSocket
    log.info('连接 WebSocket...');
    const ws = new WebSocket(WS_URL);
    
    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        log.success('WebSocket 已连接');
        resolve();
      });
      ws.on('error', reject);
      
      setTimeout(() => reject(new Error('WebSocket 连接超时')), 10000);
    });
    
    // 监听 WebSocket 消息
    const wsMessages = [];
    let installProgress = 0;
    let installComplete = false;
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        wsMessages.push(message);
        
        log.debug(`[WS消息] ${JSON.stringify(message)}`);
        
        // 处理安装进度消息
        if (message.type === 'node-install-progress') {
          installProgress = message.data.progress;
          log.info(`安装进度: ${installProgress}% - ${message.data.message}`);
        }
        
        // 处理安装完成消息
        if (message.type === 'node-install-complete') {
          installComplete = true;
          if (message.data.success) {
            log.success(`安装完成: ${message.data.message}`);
          } else {
            log.error(`安装失败: ${message.data.message}`);
          }
        }
        
        // 处理安装错误消息
        if (message.type === 'node-install-error') {
          log.error(`安装错误: ${message.data.message}`);
        }
        
        // 处理安装日志
        if (message.type === 'node-install-log') {
          log.debug(`[安装日志] ${message.data.message}`);
        }
      } catch (e) {
        log.debug(`[WS原始消息] ${data.toString()}`);
      }
    });
    
    // 3. 获取当前版本列表
    log.info('\n获取 Node.js 版本列表...');
    const versionData = await httpRequest(`${API_BASE}/fnm/versions`);
    
    if (versionData.success) {
      log.success(`已安装版本: ${versionData.data.installed.join(', ') || '无'}`);
      log.success(`当前版本: ${versionData.data.current || 'N/A'}`);
    } else {
      log.error('获取版本列表失败');
    }
    
    // 4. 测试安装新版本
    const testVersion = '18.20.5';  // 选择一个较小的版本进行测试
    log.info(`\n开始安装 Node.js ${testVersion}...`);
    
    // 发起安装请求
    const installPromise = httpRequest(`${API_BASE}/fnm/install-node`, {
      method: 'POST',
      body: { version: testVersion }
    });
    
    // 等待安装完成或超时
    const timeout = 180000; // 3分钟超时
    const startTime = Date.now();
    
    while (!installComplete && Date.now() - startTime < timeout) {
      await delay(1000);
    }
    
    // 等待 HTTP 响应
    const installResult = await installPromise;
    
    if (installResult.success) {
      log.success(`\nHTTP响应: 安装成功 - ${installResult.data.message}`);
    } else {
      log.error(`\nHTTP响应: 安装失败 - ${installResult.message}`);
      if (installResult.error) {
        log.error(`错误详情: ${installResult.error}`);
      }
    }
    
    // 5. 验证安装
    log.info('\n验证安装结果...');
    const newVersionData = await httpRequest(`${API_BASE}/fnm/versions`);
    
    if (newVersionData.success) {
      const installed = newVersionData.data.installed;
      if (installed.includes(testVersion)) {
        log.success(`✓ Node.js ${testVersion} 已成功安装`);
      } else {
        log.error(`✗ Node.js ${testVersion} 未在安装列表中`);
      }
      log.info(`当前已安装: ${installed.join(', ') || '无'}`);
    }
    
    // 6. 输出统计
    log.info('\n=== 测试统计 ===');
    log.info(`WebSocket 消息总数: ${wsMessages.length}`);
    log.info(`最终进度: ${installProgress}%`);
    log.info(`安装完成: ${installComplete ? '是' : '否'}`);
    
    // 关闭连接
    ws.close();
    
  } catch (error) {
    log.error(`测试失败: ${error.message}`);
  } finally {
    // 清理
    log.info('\n清理测试环境...');
    serverProcess.kill();
    await delay(1000);
    log.success('测试完成');
  }
}

// 运行测试
testNodeInstall().catch(console.error);