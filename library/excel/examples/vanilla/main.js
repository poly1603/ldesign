import { ExcelViewer } from '@ldesign/excel-viewer-core';

let viewer = null;
const statusEl = document.getElementById('status');

// 初始化
function init() {
  try {
    viewer = new ExcelViewer({
      container: '#excel-viewer',
      showToolbar: true,
      showFormulaBar: true,
      showSheetTabs: true,
      allowEdit: true,
      lang: 'zh',
      theme: 'light',
      hooks: {
        afterLoad: (data) => {
          updateStatus(`✅ 成功加载 ${data.length} 个工作表`);
        },
        onError: (error) => {
          updateStatus(`❌ 错误: ${error.message}`);
        },
        onCellClick: (sheetIndex, row, col, value) => {
          console.log('单元格点击:', { sheetIndex, row, col, value });
        }
      }
    });

    updateStatus('✅ 查看器初始化成功');
  } catch (error) {
    updateStatus(`❌ 初始化失败: ${error.message}`);
    console.error(error);
  }
}

// 文件选择
document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file && viewer) {
    try {
      updateStatus('⏳ 正在加载文件...');
      await viewer.loadFile(file);
    } catch (error) {
      updateStatus(`❌ 加载失败: ${error.message}`);
    }
  }
});

// 加载示例文件
window.loadSampleFile = async () => {
  if (!viewer) return;
  
  try {
    updateStatus('⏳ 正在加载示例文件...');
    // 这里可以加载一个示例 Excel 文件
    alert('请提供示例文件 URL');
  } catch (error) {
    updateStatus(`❌ 加载示例文件失败: ${error.message}`);
  }
};

// 导出为 Excel
window.exportToExcel = () => {
  if (!viewer) return;
  
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
  if (!viewer) return;
  
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
window.exportScreenshot = async () => {
  if (!viewer) return;
  
  try {
    updateStatus('⏳ 正在生成截图...');
    await viewer.downloadScreenshot('screenshot.png');
    updateStatus('✅ 截图已下载');
  } catch (error) {
    updateStatus(`❌ 截图失败: ${error.message}`);
  }
};

// 搜索内容
window.searchContent = () => {
  if (!viewer) return;
  
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
  statusEl.textContent = message;
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);


