import '@ldesign/excel-viewer-lit';

const viewer = document.getElementById('viewer');

// 监听事件
viewer.addEventListener('load', (e) => {
  const sheets = e.detail.sheets || [];
  updateStatus(`✅ 成功加载 ${sheets.length} 个工作表`);
});

viewer.addEventListener('load-error', (e) => {
  updateStatus(`❌ 加载失败: ${e.detail.message}`);
});

viewer.addEventListener('cell-click', (e) => {
  console.log('单元格点击:', e.detail);
});

viewer.addEventListener('cell-change', (e) => {
  console.log('单元格变化:', e.detail);
});

// 文件选择
document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      updateStatus('⏳ 正在加载文件...');
      await viewer.loadFile(file);
    } catch (error) {
      updateStatus(`❌ 加载失败: ${error.message}`);
    }
  }
});

// 加载示例文件
window.loadSampleFile = () => {
  alert('请提供示例文件 URL');
};

// 导出为 Excel
window.exportToExcel = () => {
  try {
    viewer.downloadFile({
      format: 'xlsx',
      filename: 'export.xlsx',
      includeStyles: true,
      includeFormulas: true
    });
    updateStatus('✅ Excel 文件已下载');
  } catch (error) {
    updateStatus(`❌ 导出失败: ${error.message}`);
  }
};

// 导出为 CSV
window.exportToCSV = () => {
  try {
    viewer.downloadFile({
      format: 'csv',
      filename: 'export.csv'
    });
    updateStatus('✅ CSV 文件已下载');
  } catch (error) {
    updateStatus(`❌ 导出失败: ${error.message}`);
  }
};

// 导出截图
window.exportScreenshot = () => {
  updateStatus('📸 截图功能开发中...');
};

// 搜索内容
window.searchContent = () => {
  const keyword = document.getElementById('search-input').value;
  if (!keyword) {
    alert('请输入搜索关键词');
    return;
  }

  try {
    const results = viewer.search({
      keyword,
      caseSensitive: false,
      matchWholeWord: false
    });
    
    updateStatus(`🔍 找到 ${results.length} 个匹配项`);
    console.log('搜索结果:', results);
  } catch (error) {
    updateStatus(`❌ 搜索失败: ${error.message}`);
  }
};

// 更新状态
function updateStatus(message) {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
  }
}


