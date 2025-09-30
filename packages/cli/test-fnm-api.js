/**
 * 测试 FNM API
 */

const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// 测试 API 端点
async function testApi(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch {
          resolve({ success: false, error: 'Invalid JSON', data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function main() {
  console.log('🧪 开始测试 FNM API...\n');

  try {
    // 1. 测试健康检查
    console.log('1️⃣ 测试健康检查...');
    const health = await testApi('GET', '/api/health');
    console.log('结果:', health);
    console.log('');

    // 2. 测试 FNM 状态
    console.log('2️⃣ 测试 FNM 状态...');
    const status = await testApi('GET', '/api/fnm/status');
    console.log('结果:', status);
    console.log('');

    // 3. 测试获取版本列表
    console.log('3️⃣ 测试获取版本列表...');
    const versions = await testApi('GET', '/api/fnm/versions');
    console.log('结果:', versions);
    console.log('');

    // 4. 测试推荐版本列表
    console.log('4️⃣ 测试推荐版本列表...');
    const recommended = await testApi('GET', '/api/fnm/recommended-versions');
    console.log('结果:', recommended);
    console.log('');

    // 5. 测试系统 Node 版本
    console.log('5️⃣ 测试系统 Node 版本...');
    const systemNode = await testApi('GET', '/api/system/node-version');
    console.log('结果:', systemNode);
    console.log('');

    console.log('✅ 所有测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

main();