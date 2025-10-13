import './style.css'

// 等待插件加载完成
async function waitForPlugin() {
  // 等待 UniversalPDFViewer 插件可用
  while (typeof window.UniversalPDFViewer === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// 示例 PDF 文档列表
const samplePDFs = [
  {
    name: 'PDF.js 示例文档',
    url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
    description: '简单的Hello World PDF',
  },
  {
    name: 'PDF 测试文档',
    url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    description: '多页文档，包含图表和文本',
  },
  {
    name: 'W3C 测试文档',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: '标准测试文档',
  },
  {
    name: 'Canvas API 教程',  
    url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    description: 'Canvas 编程文档',
  },
  {
    name: 'JavaScript 手册',
    url: 'https://eloquentjavascript.net/Eloquent_JavaScript_small.pdf',
    description: 'JS编程指南精简版',
  }
];

let pdfViewer = null;

// 全局函数，供 HTML 按钮调用
window.loadSamplePDF = function(index) {
  const pdf = samplePDFs[index - 1];
  if (pdf && pdf.url) {
    loadPDFUrl(pdf.url);
    // 更新选择器
    const pdfSelect = document.getElementById('pdfSelect');
    if (pdfSelect) {
      pdfSelect.value = pdf.url;
    }
  }
};

// 加载 PDF URL
async function loadPDFUrl(url) {
  try {
    // 确保插件已加载
    await waitForPlugin();
    
    // 销毁现有查看器
    if (pdfViewer) {
      pdfViewer.destroy();
    }
    
    // 显示加载提示
    const container = document.querySelector('#pdfViewerContainer');
    if (container) {
      container.innerHTML = '<div class="placeholder"><div class="placeholder-content"><h3>正在加载 PDF...</h3><p>' + url + '</p></div></div>';
    }
    
    // 创建新查看器 - 使用插件提供的 UniversalPDFViewer
    pdfViewer = new window.UniversalPDFViewer({
      container: '#pdfViewerContainer',
      pdfUrl: url,
      theme: document.body.getAttribute('data-theme') || 'light',
      defaultScale: 1.0,
      enableToolbar: document.getElementById('showToolbar')?.checked !== false,
      showThumbnails: document.getElementById('showThumbnails')?.checked !== false,
      showAnnotations: document.getElementById('showAnnotations')?.checked !== false, 
      enableSearch: document.getElementById('enableSearch')?.checked !== false,
      enablePrint: document.getElementById('enablePrint')?.checked !== false,
      enableDownload: document.getElementById('enableDownload')?.checked !== false
    });
    
    // 监听事件
    pdfViewer.on('loaded', (data) => {
      console.log('PDF loaded:', data);
      logToEventLog(`PDF 加载成功: ${data.totalPages || data.numPages} 页`, 'success');
    });
    
    pdfViewer.on('error', (error) => {
      console.error('PDF loading error:', error);
      logToEventLog(`PDF 加载失败: ${error.message}`, 'error');
      
      // 显示错误信息和备选方案
      if (container) {
        container.innerHTML = `
          <div class="placeholder">
            <div class="placeholder-content">
              <h3>❌ PDF 加载失败</h3>
              <p style="color: #e74c3c;">${error.message}</p>
              <p>请尝试其他示例文档或检查URL</p>
              <div class="sample-buttons">
                <button onclick="loadSamplePDF(1)" class="btn-primary">加载示例 1</button>
                <button onclick="loadSamplePDF(3)" class="btn-primary">加载示例 3</button>
              </div>
            </div>
          </div>
        `;
      }
    });
    
    pdfViewer.on('pageChanged', (data) => {
      console.log('Page changed:', data);
      logToEventLog(`切换到第 ${data.currentPage || data.page} 页`);
    });
    
  } catch (error) {
    console.error('加载 PDF 失败:', error);
    logToEventLog(`加载失败: ${error.message}`, 'error');
  }
}

// 加载本地 PDF 文件
function loadPDFFile(file) {
  const fileReader = new FileReader();
  
  fileReader.onload = async function() {
    const typedArray = new Uint8Array(this.result);
    
    // 确保插件已加载
    await waitForPlugin();
    
    // 销毁现有查看器
    if (pdfViewer) {
      pdfViewer.destroy();
    }
    
    // 创建新查看器
    pdfViewer = new window.UniversalPDFViewer({
      container: '#pdfViewerContainer',
      theme: document.body.getAttribute('data-theme') || 'light',
      enableToolbar: document.getElementById('showToolbar')?.checked !== false,
      showThumbnails: document.getElementById('showThumbnails')?.checked !== false,
      enableSearch: document.getElementById('enableSearch')?.checked !== false,
      enablePrint: document.getElementById('enablePrint')?.checked !== false,
      enableDownload: document.getElementById('enableDownload')?.checked !== false
    });
    
    // 加载 PDF 数据
    if (pdfViewer.loadPDFData) {
      pdfViewer.loadPDFData(typedArray);
    } else if (pdfViewer.loadPDF) {
      pdfViewer.loadPDF(typedArray);
    }
    
    // 监听事件
    pdfViewer.on('loaded', (data) => {
      logToEventLog(`本地文件加载成功: ${file.name}`, 'success');
    });
  };
  
  fileReader.readAsArrayBuffer(file);
}

// 更新查看器选项
function updateViewerOption(option, value) {
  console.log(`Option ${option} set to ${value}`);
  if (pdfViewer && pdfViewer.setOption) {
    pdfViewer.setOption(option, value);
  }
  logToEventLog(`选项 ${option} 设置为 ${value}`);
}

// 应用主题
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  if (pdfViewer) {
    if (pdfViewer.setTheme) {
      pdfViewer.setTheme(theme);
    } else if (pdfViewer.updateTheme) {
      pdfViewer.updateTheme(theme);
    }
  }
  
  // 更新按钮状态
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });
  
  logToEventLog(`切换到${theme === 'dark' ? '深色' : theme === 'sepia' ? '护眼' : '浅色'}主题`);
}

// 记录到事件日志
function logToEventLog(message, type = 'info') {
  const eventLog = document.querySelector('#eventLog');
  if (eventLog) {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const time = new Date().toLocaleTimeString();
    entry.innerHTML = `<span style="color: #999;">[${time}]</span> ${message}`;
    eventLog.appendChild(entry);
    eventLog.scrollTop = eventLog.scrollHeight;
    
    // 限制日志数量
    const entries = eventLog.querySelectorAll('.log-entry');
    if (entries.length > 50) {
      entries[0].remove();
    }
  }
}

// 设置演示控件
function setupDemoControls() {
  // PDF 选择器
  const pdfSelect = document.getElementById('pdfSelect');
  if (pdfSelect) {
    // 填充示例 PDF 选项
    pdfSelect.innerHTML = '<option value="">选择一个PDF文件...</option>';
    samplePDFs.forEach((pdf, index) => {
      const option = document.createElement('option');
      option.value = pdf.url;
      option.textContent = `${pdf.name} - ${pdf.description}`;
      pdfSelect.appendChild(option);
    });
    
    pdfSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        loadPDFUrl(e.target.value);
      }
    });
  }
  
  // 文件上传
  const fileInput = document.getElementById('fileInput');
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      loadPDFFile(file);
    }
  });
  
  // URL 加载
  const loadUrlBtn = document.getElementById('loadUrlBtn');
  loadUrlBtn?.addEventListener('click', () => {
    const urlInput = document.getElementById('urlInput');
    if (urlInput.value) {
      loadPDFUrl(urlInput.value);
    }
  });
  
  // 查看器选项
  const options = ['showToolbar', 'showThumbnails', 'showAnnotations', 'enableSearch', 'enablePrint', 'enableDownload'];
  options.forEach(option => {
    const checkbox = document.getElementById(option);
    checkbox?.addEventListener('change', (e) => {
      updateViewerOption(option, e.target.checked);
    });
  });
  
  // 主题按钮
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const theme = e.target.dataset.theme;
      applyTheme(theme);
    });
  });
  
  // 清除日志按钮
  const clearLogBtn = document.getElementById('clearLog');
  clearLogBtn?.addEventListener('click', () => {
    const eventLog = document.getElementById('eventLog');
    if (eventLog) {
      eventLog.innerHTML = '<div class="log-entry">日志已清除</div>';
    }
  });
}

// 更新占位符按钮
function updatePlaceholderButtons() {
  const placeholder = document.querySelector('.placeholder-content');
  if (!placeholder) return;
  
  // 找到或创建按钮容器
  let buttonsContainer = placeholder.querySelector('.sample-buttons');
  if (!buttonsContainer) {
    buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'sample-buttons';
    placeholder.appendChild(buttonsContainer);
  }
  
  // 清空并重新添加按钮
  buttonsContainer.innerHTML = '';
  
  // 只显示前3个示例作为快速访问按钮
  const maxButtons = Math.min(3, samplePDFs.length);
  for (let i = 0; i < maxButtons; i++) {
    const pdf = samplePDFs[i];
    const button = document.createElement('button');
    button.className = 'btn-primary';
    button.textContent = pdf.name;
    button.title = pdf.description;
    button.onclick = () => loadPDFUrl(pdf.url);
    button.style.margin = '0.25rem';
    buttonsContainer.appendChild(button);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 等待插件加载
  await waitForPlugin();
  
  // 设置演示控件
  setupDemoControls();
  
  // 更新占位符按钮
  updatePlaceholderButtons();
  
  // 记录插件已就绪
  logToEventLog('PDF Viewer 插件已就绪', 'success');
});

// 导出给全局使用
window.loadPDFUrl = loadPDFUrl;
window.pdfViewer = pdfViewer;