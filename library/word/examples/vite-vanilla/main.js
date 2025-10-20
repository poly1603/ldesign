import { WordViewer } from '@word-viewer/core';
import './style.css';

let viewer;
let currentTheme = 'light';

// 初始化查看器
function initViewer() {
  try {
    viewer = new WordViewer('#viewer', {
      theme: currentTheme,
      editable: false,
      showToolbar: false,
    });

    // 绑定事件
    viewer.on('loaded', (data) => {
      showStatus('✅ 文档加载成功！', 'success');
      updateDocInfo();
      console.log('文档已加载', data);
    });

    viewer.on('error', (error) => {
      showStatus(`❌ 错误: ${error.message}`, 'error');
      console.error('错误', error);
    });

    viewer.on('progress', (progress) => {
      showStatus(`⏳ 加载中... ${progress.percentage}%`, 'info');
    });

    viewer.on('changed', () => {
      showStatus('📝 文档已修改', 'info');
      console.log('文档已修改');
    });

    viewer.on('zoom', (level) => {
      showStatus(`🔍 缩放: ${Math.round(level * 100)}%`, 'info');
    });

    showStatus('✅ 查看器初始化成功！', 'success');
  } catch (error) {
    showStatus(`❌ 初始化失败: ${error.message}`, 'error');
    console.error('初始化错误', error);
  }
}

// 更新文档信息
function updateDocInfo() {
  const info = viewer.getDocumentInfo();
  const pageInfo = viewer.getPageInfo();
  const editState = viewer.getEditState();

  const infoHtml = `
    <p><strong>标题:</strong> ${info?.title || '未知'}</p>
    <p><strong>作者:</strong> ${info?.author || '未知'}</p>
    <p><strong>页数:</strong> ${pageInfo.total}</p>
    <p><strong>当前页:</strong> ${pageInfo.current}</p>
    <p><strong>字数:</strong> ${info?.wordCount || '未知'}</p>
    <p><strong>编辑中:</strong> ${editState.isEditing ? '是' : '否'}</p>
    <p><strong>已修改:</strong> ${editState.isDirty ? '是' : '否'}</p>
  `;

  document.getElementById('doc-info').innerHTML = infoHtml;
}

// 显示状态消息
function showStatus(message, type = 'info') {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type} show`;
  setTimeout(() => {
    status.classList.remove('show');
  }, 3000);
}

// 文件选择
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file && viewer) {
    try {
      await viewer.loadFile(file);
    } catch (error) {
      console.error('加载失败', error);
    }
  }
});

// 工具栏按钮
document.getElementById('btn-zoom-in').addEventListener('click', () => {
  if (viewer) {
    viewer.setZoom(viewer.getZoom() + 0.1);
  }
});

document.getElementById('btn-zoom-out').addEventListener('click', () => {
  if (viewer) {
    viewer.setZoom(viewer.getZoom() - 0.1);
  }
});

document.getElementById('btn-toggle-edit').addEventListener('click', () => {
  if (viewer) {
    const state = viewer.getEditState();
    if (state.isEditing) {
      viewer.disableEdit();
      showStatus('📖 已切换到查看模式', 'info');
    } else {
      viewer.enableEdit();
      showStatus('✏️ 已切换到编辑模式', 'info');
    }
    updateDocInfo();
  }
});

document.getElementById('btn-toggle-theme').addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  if (viewer) {
    viewer.updateOptions({ theme: currentTheme });
    showStatus(`🌓 已切换到${currentTheme === 'light' ? '浅色' : '深色'}主题`, 'info');
  }
});

document.getElementById('btn-export-pdf').addEventListener('click', async () => {
  if (viewer) {
    try {
      showStatus('⏳ 正在导出 PDF...', 'info');
      const blob = await viewer.exportToPDF();
      downloadBlob(blob, 'document.pdf');
      showStatus('✅ PDF 导出成功！', 'success');
    } catch (error) {
      showStatus(`❌ 导出失败: ${error.message}`, 'error');
    }
  }
});

document.getElementById('btn-export-html').addEventListener('click', () => {
  if (viewer) {
    try {
      const html = viewer.exportToHTML();
      const blob = new Blob([html], { type: 'text/html' });
      downloadBlob(blob, 'document.html');
      showStatus('✅ HTML 导出成功！', 'success');
    } catch (error) {
      showStatus(`❌ 导出失败: ${error.message}`, 'error');
    }
  }
});

document.getElementById('btn-search').addEventListener('click', () => {
  const keyword = document.getElementById('searchInput').value;
  if (keyword && viewer) {
    const results = viewer.search(keyword);
    showStatus(`🔍 找到 ${results.length} 个结果`, 'success');
    console.log('搜索结果:', results);
  }
});

// 搜索框回车键
document.getElementById('searchInput').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('btn-search').click();
  }
});

// 下载文件
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 初始化
initViewer();

