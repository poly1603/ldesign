import { PDFViewer } from '@ldesign/pdf';

const WORKER_SRC = '/pdf.worker.min.mjs';
const DEFAULT_PDF = 'https://pdfobject.com/pdf/sample.pdf';

let currentViewer = null;
let currentDemo = 'basic';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initDemoNavigation();
  initBasicDemo();
  initFileUpload();
});

// 初始化示例导航
function initDemoNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const demos = document.querySelectorAll('.demo');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const demoId = btn.dataset.demo;

      // 更新按钮状态
      navButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // 更新示例显示
      demos.forEach((d) => d.classList.remove('active'));
      document.getElementById(`demo-${demoId}`).classList.add('active');

      // 切换示例
      currentDemo = demoId;
      switchDemo(demoId);
    });
  });
}

// 切换示例
function switchDemo(demoId) {
  // 销毁当前查看器
  if (currentViewer) {
    currentViewer.destroy();
    currentViewer = null;
  }

  // 初始化新示例
  switch (demoId) {
    case 'basic':
      initBasicDemo();
      break;
    case 'advanced':
      initAdvancedDemo();
      break;
    case 'events':
      initEventsDemo();
      break;
    case 'plugins':
      initPluginsDemo();
      break;
  }
}

// 基础示例
function initBasicDemo() {
  currentViewer = new PDFViewer({
    container: '#pdf-container',
    workerSrc: WORKER_SRC,
    scale: 1.2,
    quality: 'medium',
    on: {
      loadComplete: (info) => {
        updateDocInfo(info);
        updatePageControls();
      },
      pageChange: (page) => {
        document.getElementById('page-input').value = page;
        updatePageControls();
      },
      scaleChange: (scale) => {
        document.getElementById('scale-display').textContent =
          Math.round(scale * 100) + '%';
      },
    },
  });

  currentViewer.load(DEFAULT_PDF);

  // 绑定控制按钮
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageInput = document.getElementById('page-input');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const rotateBtn = document.getElementById('rotate-btn');
  const printBtn = document.getElementById('print-btn');
  const downloadBtn = document.getElementById('download-btn');

  prevBtn.onclick = () => currentViewer.previousPage();
  nextBtn.onclick = () => currentViewer.nextPage();

  pageInput.onchange = (e) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= currentViewer.totalPages) {
      currentViewer.goToPage(page);
    }
  };

  zoomInBtn.onclick = () => currentViewer.zoomIn(0.2);
  zoomOutBtn.onclick = () => currentViewer.zoomOut(0.2);
  rotateBtn.onclick = () => currentViewer.rotate(90);
  printBtn.onclick = () => currentViewer.print();
  downloadBtn.onclick = () => currentViewer.download('document.pdf');

  updatePageControls();
}

// 高级功能示例
function initAdvancedDemo() {
  currentViewer = new PDFViewer({
    container: '#pdf-container-advanced',
    workerSrc: WORKER_SRC,
    scale: 'auto',
    quality: 'medium',
    cache: {
      enabled: true,
      maxPages: 100,
      strategy: 'lru',
      preloadPages: 5,
    },
    on: {
      loadComplete: (info) => {
        updateDocInfo(info);
      },
      searchComplete: (results) => {
        displaySearchResults(results);
      },
    },
  });

  currentViewer.load(DEFAULT_PDF);

  // 应用设置按钮
  const applyBtn = document.getElementById('apply-settings-btn');
  applyBtn.onclick = () => {
    const scaleMode = document.getElementById('scale-mode').value;
    const scale = isNaN(parseFloat(scaleMode)) ? scaleMode : parseFloat(scaleMode);
    currentViewer.setScale(scale);
  };

  // 搜索功能
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  searchBtn.onclick = async () => {
    const query = searchInput.value.trim();
    if (query) {
      const results = await currentViewer.search(query);
      displaySearchResults(results);
    }
  };

  searchInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  };
}

// 事件系统示例
function initEventsDemo() {
  const logContainer = document.getElementById('event-log');
  const clearBtn = document.getElementById('clear-log-btn');

  clearBtn.onclick = () => {
    logContainer.innerHTML = '';
  };

  function logEvent(eventName, data) {
    const time = new Date().toLocaleTimeString();
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.innerHTML = `
      <span class="log-time">[${time}]</span>
      <span class="log-event">${eventName}</span>
      <span>${JSON.stringify(data, null, 2)}</span>
    `;
    logContainer.appendChild(logItem);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  currentViewer = new PDFViewer({
    container: '#pdf-container-events',
    workerSrc: WORKER_SRC,
    on: {
      loadStart: (source) => logEvent('loadStart', { source }),
      loadProgress: (progress) => logEvent('loadProgress', { progress }),
      loadComplete: (info) => {
        logEvent('loadComplete', info);
        updateDocInfo(info);
      },
      loadError: (error) => logEvent('loadError', { message: error.message }),
      pageChange: (page) => logEvent('pageChange', { page }),
      scaleChange: (scale) => logEvent('scaleChange', { scale }),
      renderStart: (page) => logEvent('renderStart', { page }),
      renderComplete: (page) => logEvent('renderComplete', { page }),
      renderError: (page, error) => logEvent('renderError', { page, error: error.message }),
    },
  });

  currentViewer.load(DEFAULT_PDF);
}

// 插件系统示例
function initPluginsDemo() {
  // 自定义插件：页面计数器
  const pageCounterPlugin = {
    name: 'page-counter',
    version: '1.0.0',
    install(viewer) {
      console.log('页面计数器插件已安装');
    },
    hooks: {
      afterLoad: async (doc) => {
        console.log(`文档共有 ${doc.numPages} 页`);
      },
      beforeRender: async (page) => {
        console.log(`开始渲染第 ${page.pageNumber} 页`);
      },
      afterRender: async (page, canvas) => {
        console.log(`第 ${page.pageNumber} 页渲染完成`);
      },
    },
  };

  // 自定义插件：性能监控
  const performancePlugin = {
    name: 'performance-monitor',
    version: '1.0.0',
    loadStartTime: 0,
    renderStartTime: 0,
    install(viewer) {
      console.log('性能监控插件已安装');
    },
    hooks: {
      beforeLoad: async (source) => {
        this.loadStartTime = Date.now();
      },
      afterLoad: async (doc) => {
        const loadTime = Date.now() - this.loadStartTime;
        console.log(`文档加载耗时: ${loadTime}ms`);
      },
      beforeRender: async (page) => {
        this.renderStartTime = Date.now();
      },
      afterRender: async (page, canvas) => {
        const renderTime = Date.now() - this.renderStartTime;
        console.log(`页面渲染耗时: ${renderTime}ms`);
      },
    },
  };

  currentViewer = new PDFViewer({
    container: '#pdf-container-plugins',
    workerSrc: WORKER_SRC,
    plugins: [pageCounterPlugin, performancePlugin],
    on: {
      loadComplete: (info) => {
        updateDocInfo(info);
      },
    },
  });

  currentViewer.load(DEFAULT_PDF);

  // 显示插件列表
  const pluginList = document.getElementById('plugin-list');
  pluginList.innerHTML = `
    <li>📊 ${pageCounterPlugin.name} v${pageCounterPlugin.version}</li>
    <li>⚡ ${performancePlugin.name} v${performancePlugin.version}</li>
  `;
}

// 文件上传
function initFileUpload() {
  const fileInput = document.getElementById('file-input');
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && currentViewer) {
      const url = URL.createObjectURL(file);
      currentViewer.load(url);
    }
  });
}

// 更新文档信息
function updateDocInfo(info) {
  const docInfo = document.getElementById('doc-info');
  docInfo.innerHTML = `
    <p><strong>标题:</strong> ${info.title || '未知'}</p>
    <p><strong>作者:</strong> ${info.author || '未知'}</p>
    <p><strong>页数:</strong> ${info.numPages}</p>
    <p><strong>版本:</strong> ${info.pdfVersion || '未知'}</p>
  `;
}

// 更新页面控制
function updatePageControls() {
  if (!currentViewer) return;

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageTotal = document.getElementById('page-total');

  if (prevBtn) prevBtn.disabled = currentViewer.currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentViewer.currentPage >= currentViewer.totalPages;
  if (pageTotal) pageTotal.textContent = `/ ${currentViewer.totalPages}`;
}

// 显示搜索结果
function displaySearchResults(results) {
  const container = document.getElementById('search-results');

  if (results.length === 0) {
    container.innerHTML = '<p>未找到匹配项</p>';
    return;
  }

  container.innerHTML = `
    <p>找到 ${results.length} 个匹配项:</p>
    ${results.map((result, index) => `
      <div class="search-result-item" onclick="goToSearchResult(${result.pageNumber})">
        <strong>第 ${result.pageNumber} 页</strong> - ${result.context || result.text}
      </div>
    `).join('')}
  `;
}

// 跳转到搜索结果
window.goToSearchResult = (pageNumber) => {
  if (currentViewer) {
    currentViewer.goToPage(pageNumber);
  }
};
