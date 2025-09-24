/**
 * 样式入口文件
 * 
 * 导入所有必要的CSS样式文件
 */

// 导入节点布局样式
import './node-layout.css'

// 导入移动端样式
import '../mobile/mobile-styles.css'

/**
 * 初始化样式
 * 确保所有样式都被正确加载
 */
export function initStyles(): void {
  // 检查是否已经加载了样式
  const existingStyle = document.querySelector('[data-flowchart-node-layout]')
  if (existingStyle) {
    return
  }

  // 创建样式标记
  const styleMarker = document.createElement('meta')
  styleMarker.setAttribute('data-flowchart-node-layout', 'loaded')
  document.head.appendChild(styleMarker)

  // 添加基础的节点布局样式（作为备用）
  const baseStyles = `
    /* 基础节点布局样式 - 备用 */
    .lf-node-text {
      text-anchor: middle;
      dominant-baseline: middle;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 400;
      line-height: 1.2;
      pointer-events: none;
      user-select: none;
    }

    .lf-node-icon {
      pointer-events: none;
      user-select: none;
    }

    /* 圆形节点 */
    .lf-node-circle .lf-node-icon {
      transform: translateY(-6px);
    }

    .lf-node-circle .lf-node-text {
      transform: translateY(10px);
      font-size: 11px;
      font-weight: 500;
    }

    /* 矩形节点 */
    .lf-node-rect .lf-node-icon {
      transform: translateY(-8px);
    }

    .lf-node-rect .lf-node-text {
      transform: translateY(12px);
      font-size: 12px;
    }

    /* 菱形节点 */
    .lf-node-diamond .lf-node-icon {
      transform: translateY(-6px) scale(0.9);
    }

    .lf-node-diamond .lf-node-text {
      transform: translateY(10px);
      font-size: 11px;
      font-weight: 500;
    }

    /* 节点类型特定样式 */
    .lf-node-start .lf-node-icon {
      color: #52c41a;
      fill: #52c41a;
      stroke: #52c41a;
    }

    .lf-node-start .lf-node-text {
      fill: #135200;
      font-weight: 600;
    }

    .lf-node-end .lf-node-icon {
      color: #ff4d4f;
      fill: #ff4d4f;
      stroke: #ff4d4f;
    }

    .lf-node-end .lf-node-text {
      fill: #820014;
      font-weight: 600;
    }

    .lf-node-approval .lf-node-icon {
      color: #722ed1;
      fill: #722ed1;
      stroke: #722ed1;
    }

    .lf-node-approval .lf-node-text {
      fill: #2f1b69;
      font-weight: 500;
    }

    .lf-node-condition .lf-node-icon {
      color: #fa8c16;
      fill: #fa8c16;
      stroke: #fa8c16;
    }

    .lf-node-condition .lf-node-text {
      fill: #613400;
      font-weight: 500;
    }

    .lf-node-process .lf-node-icon {
      color: #595959;
      fill: #595959;
      stroke: #595959;
    }

    .lf-node-process .lf-node-text {
      fill: #262626;
      font-weight: 500;
    }

    .lf-node-user-task .lf-node-icon {
      color: #1890ff;
      fill: #1890ff;
      stroke: #1890ff;
    }

    .lf-node-user-task .lf-node-text {
      fill: #003a8c;
      font-weight: 500;
    }

    .lf-node-service-task .lf-node-icon {
      color: #13c2c2;
      fill: #13c2c2;
      stroke: #13c2c2;
    }

    .lf-node-service-task .lf-node-text {
      fill: #006d75;
      font-weight: 500;
    }

    .lf-node-custom-material .lf-node-icon {
      transform: translateY(-8px);
    }

    .lf-node-custom-material .lf-node-text {
      transform: translateY(12px);
      font-size: 11px;
      font-weight: 500;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .lf-node-text {
        font-size: 10px;
      }
      
      .lf-node-icon {
        transform: scale(0.8);
      }
    }

    /* 悬停效果 */
    .lf-node:hover .lf-node-icon {
      transform: translateY(-6px) scale(1.1);
      transition: transform 0.2s ease-out;
    }

    .lf-node:hover .lf-node-text {
      font-weight: 600;
      transition: font-weight 0.2s ease-out;
    }

    /* 选中状态 */
    .lf-node.lf-node-selected .lf-node-icon {
      transform: translateY(-6px) scale(1.2);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .lf-node.lf-node-selected .lf-node-text {
      font-weight: 700;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }
  `

  // 如果CSS文件没有加载，添加备用样式
  const styleElement = document.createElement('style')
  styleElement.setAttribute('data-flowchart-backup-styles', 'true')
  styleElement.textContent = baseStyles
  document.head.appendChild(styleElement)
}

/**
 * 清理样式
 */
export function cleanupStyles(): void {
  const styleMarker = document.querySelector('[data-flowchart-node-layout]')
  if (styleMarker) {
    styleMarker.remove()
  }

  const backupStyles = document.querySelector('[data-flowchart-backup-styles]')
  if (backupStyles) {
    backupStyles.remove()
  }
}

// 自动初始化样式
if (typeof window !== 'undefined') {
  // 在DOM加载完成后初始化样式
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStyles)
  } else {
    initStyles()
  }
}

export default {
  initStyles,
  cleanupStyles
}
