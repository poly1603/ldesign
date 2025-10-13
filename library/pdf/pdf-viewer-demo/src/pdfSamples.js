// PDF示例文档配置
export const samplePDFs = [
  {
    name: 'PDF.js 示例文档',
    url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    description: '学术论文示例，包含图表和公式',
    size: '1.1 MB',
    pages: 14,
    reliable: true
  },
  {
    name: 'W3C 测试文档',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: '标准测试文档',
    size: '13 KB',
    pages: 1,
    reliable: true
  },
  {
    name: '本地示例 1',
    url: './samples/sample1.pdf',
    description: '本地测试文档',
    local: true,
    reliable: false
  },
  {
    name: '本地示例 2',
    url: './samples/sample2.pdf',
    description: '本地多页文档',
    local: true,
    reliable: false
  }
];

// 备用PDF源（如果主源失败）
export const fallbackPDFs = [
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
];

// PDF加载配置
export const pdfLoadConfig = {
  // 使用CORS代理的URL列表（需要代理的域名）
  corsProxyNeeded: [
    'readthedocs.org',
    'eloquentjavascript.net',
    'nasa.gov',
    'googleapis.com'
  ],
  
  // CORS代理服务（备选方案）
  corsProxies: [
    'https://api.allorigins.win/raw?url=',
    'https://cors.bridged.cc/',
    'https://cors-anywhere.herokuapp.com/'
  ],
  
  // 加载超时设置（毫秒）
  timeout: 30000,
  
  // 重试次数
  maxRetries: 2
};

// 获取可靠的PDF示例
export function getReliableSamples() {
  return samplePDFs.filter(pdf => pdf.reliable);
}

// 获取PDF URL（处理CORS）
export function getPdfUrl(url) {
  // 检查是否需要CORS代理
  const needsProxy = pdfLoadConfig.corsProxyNeeded.some(domain => url.includes(domain));
  
  if (needsProxy) {
    // 使用第一个可用的CORS代理
    return pdfLoadConfig.corsProxies[0] + encodeURIComponent(url);
  }
  
  return url;
}

// 处理PDF加载错误
export function handlePdfError(error, url) {
  const errorInfo = {
    type: 'unknown',
    message: error.message || '未知错误',
    suggestion: '请尝试其他PDF文档或上传本地文件'
  };
  
  if (error.message) {
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      errorInfo.type = 'forbidden';
      errorInfo.suggestion = '服务器拒绝访问，请使用本地文件或其他示例';
    } else if (error.message.includes('404')) {
      errorInfo.type = 'not_found';
      errorInfo.suggestion = '文件不存在，请检查URL是否正确';
    } else if (error.message.includes('CORS')) {
      errorInfo.type = 'cors';
      errorInfo.suggestion = '跨域限制，建议上传本地PDF文件';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorInfo.type = 'network';
      errorInfo.suggestion = '网络连接问题，请检查网络后重试';
    } else if (error.message.includes('Invalid PDF')) {
      errorInfo.type = 'invalid_pdf';
      errorInfo.suggestion = '无效的PDF文件格式';
    }
  }
  
  return errorInfo;
}