/**
 * 错误处理模块
 * 处理应用启动失败的情况
 */

/**
 * 显示启动失败错误页面
 */
export function showErrorPage(error: Error) {
  const errorMessage = error.message || '未知错误'
  
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: system-ui;
      background: linear-gradient(135deg, var(--ld-color-primary-500, #667eea) 0%, var(--ld-color-primary-700, #764ba2) 100%);
      color: var(--ld-color-gray-50, white);
      text-align: center;
      padding: 20px;
    ">
      <h1 style="font-size: 48px; margin: 0 0 20px 0;">😔</h1>
      <h2 style="font-size: 24px; margin: 0 0 10px 0;">应用启动失败</h2>
      <p style="font-size: 16px; margin: 0 0 20px 0; opacity: 0.9;">${errorMessage}</p>
      <button 
        onclick="location.reload()" 
        style="
          padding: 12px 24px;
          font-size: 16px;
          border: 2px solid var(--ld-color-gray-50, white);
          background: transparent;
          color: var(--ld-color-gray-50, white);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        "
        onmouseover="this.style.background='var(--ld-color-gray-50, white)'; this.style.color='var(--ld-color-primary-500, #667eea)';"
        onmouseout="this.style.background='transparent'; this.style.color='var(--ld-color-gray-50, white)';"
      >
        重新加载
      </button>
    </div>
  `
}

/**
 * 应用错误处理器
 */
export function handleAppError(error: Error, context: string) {
  console.error(`[应用错误] ${context}:`, error)
}