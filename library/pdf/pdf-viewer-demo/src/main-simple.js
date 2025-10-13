import './style.css';

// 在实际项目中，应该从 npm 包导入:
// import { SimplePDFViewer } from 'universal-pdf-viewer/core/SimplePDFViewer';

// 为了演示，我们暂时使用全局变量或模拟
// 这里假设 SimplePDFViewer 已经通过其他方式加载（如构建工具）

// 初始化应用
let viewer = null;

// 示例 PDF URLs
const samplePDFs = {
  'sample1': 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
  'sample2': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'sample3': 'https://www.africau.edu/images/default/sample.pdf'
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initializeViewer();
  setupControls();
});

function initializeViewer() {
  // 使用极简的 API 创建查看器
  // SimplePDFViewer 处理所有的 UI 和功能
  viewer = new SimplePDFViewer('#pdfViewerContainer', {
    theme: 'light',
    showToolbar: true,
    showThumbnails: true,
    enablePrint: true,
    enableDownload: true,
    defaultScale: 1.0
  });

  // 监听事件（如果需要）
  if (viewer.on) {
    viewer.on('loaded', (data) => {
      logEvent(`PDF 加载完成: ${data.totalPages} 页`);
    });

    viewer.on('pageChanged', (data) => {
      logEvent(`页面切换到: ${data.currentPage}/${data.totalPages}`);
    });

    viewer.on('error', (error) => {
      logEvent(`错误: ${error.message || error}`, 'error');
    });

    viewer.on('themeChanged', (data) => {
      logEvent(`主题切换到: ${data.theme}`);
    });

    viewer.on('thumbnailsToggled', (data) => {
      logEvent(`缩略图 ${data.visible ? '显示' : '隐藏'}`);
    });

    viewer.on('print', () => {
      logEvent('打印 PDF');
    });

    viewer.on('download', () => {
      logEvent('下载 PDF');
    });
  }
}

function setupControls() {
  // PDF 选择器
  const pdfSelect = document.getElementById('pdfSelect');
  if (pdfSelect) {
    // 填充选项
    Object.keys(samplePDFs).forEach((key, index) => {
      const option = document.createElement('option');
      option.value = samplePDFs[key];
      option.textContent = `示例 PDF ${index + 1}`;
      pdfSelect.appendChild(option);
    });

    pdfSelect.addEventListener('change', (e) => {
      if (e.target.value && viewer) {
        viewer.loadPDF(e.target.value);
      }
    });
  }

  // 文件上传
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf' && viewer) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const typedArray = new Uint8Array(event.target.result);
          viewer.loadPDF(typedArray);
        };
        reader.readAsArrayBuffer(file);
      }
    });
  }

  // URL 加载
  const loadUrlBtn = document.getElementById('loadUrlBtn');
  const urlInput = document.getElementById('urlInput');
  if (loadUrlBtn && urlInput) {
    loadUrlBtn.addEventListener('click', () => {
      if (urlInput.value && viewer) {
        viewer.loadPDF(urlInput.value);
      }
    });

    // 支持回车键加载
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && urlInput.value && viewer) {
        viewer.loadPDF(urlInput.value);
      }
    });
  }

  // 主题切换
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      if (viewer && viewer.setTheme) {
        viewer.setTheme(e.target.value);
        document.body.setAttribute('data-theme', e.target.value);
      }
    });
  }

  // 主题按钮（如果有）
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const theme = e.target.dataset.theme;
      if (viewer && viewer.setTheme) {
        viewer.setTheme(theme);
        document.body.setAttribute('data-theme', theme);
        
        // 更新按钮状态
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      }
    });
  });

  // 清除日志
  const clearLogBtn = document.getElementById('clearLog');
  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      const eventLog = document.getElementById('eventLog');
      if (eventLog) {
        eventLog.innerHTML = '<div class="log-entry">日志已清除</div>';
      }
    });
  }

  // 快速加载示例
  window.loadSamplePDF = function(index) {
    const key = `sample${index}`;
    if (samplePDFs[key] && viewer) {
      viewer.loadPDF(samplePDFs[key]);
    }
  };
}

// 日志功能
function logEvent(message, type = 'info') {
  const eventLog = document.getElementById('eventLog');
  if (eventLog) {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const time = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
    eventLog.appendChild(entry);
    eventLog.scrollTop = eventLog.scrollHeight;
    
    // 限制日志条数
    while (eventLog.children.length > 100) {
      eventLog.removeChild(eventLog.firstChild);
    }
  }
  
  // 同时输出到控制台
  if (type === 'error') {
    console.error(message);
  } else {
    console.log(message);
  }
}

// 导出给全局使用（调试用）
window.viewer = viewer;
window.SimplePDFViewer = SimplePDFViewer;