"use strict";
/**
 * 格式化工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = void 0;
exports.formatFileSize = formatFileSize;
exports.formatDuration = formatDuration;
exports.formatPercentage = formatPercentage;
exports.formatNumber = formatNumber;
exports.formatMemory = formatMemory;
exports.formatTimestamp = formatTimestamp;
exports.formatRelativeTime = formatRelativeTime;
exports.formatPath = formatPath;
exports.formatVersion = formatVersion;
exports.formatBuildStatus = formatBuildStatus;
exports.formatConfig = formatConfig;
exports.formatList = formatList;
exports.formatTable = formatTable;
exports.formatProgressBar = formatProgressBar;
exports.formatKeyValue = formatKeyValue;
exports.truncateText = truncateText;
exports.capitalize = capitalize;
exports.camelToKebab = camelToKebab;
exports.kebabToCamel = kebabToCamel;
/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}
/**
 * 格式化持续时间
 */
function formatDuration(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const seconds = ms / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
}
/**
 * 格式化百分比
 */
function formatPercentage(value, total) {
    if (total === 0)
        return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
}
/**
 * 格式化数字
 */
function formatNumber(num) {
    return num.toLocaleString();
}
/**
 * 格式化内存使用
 */
function formatMemory(bytes) {
    return formatFileSize(bytes);
}
/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}
/**
 * 格式化相对时间
 */
function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 1000) {
        return '刚刚';
    }
    if (diff < 60000) {
        return `${Math.floor(diff / 1000)}秒前`;
    }
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
    }
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
    }
    return `${Math.floor(diff / 86400000)}天前`;
}
/**
 * 格式化路径（缩短显示）
 */
function formatPath(filePath, maxLength = 50) {
    if (filePath.length <= maxLength) {
        return filePath;
    }
    const parts = filePath.split('/');
    if (parts.length <= 2) {
        return filePath;
    }
    // 保留开头和结尾，中间用 ... 替代
    const start = parts[0];
    const end = parts[parts.length - 1];
    return `${start}/.../${end}`;
}
/**
 * 格式化版本号
 */
function formatVersion(version) {
    // 移除前缀 v
    return version.replace(/^v/, '');
}
/**
 * 格式化构建状态
 */
function formatBuildStatus(status) {
    const statusMap = {
        idle: '空闲',
        initializing: '初始化中',
        building: '构建中',
        watching: '监听中',
        error: '错误',
        complete: '完成',
        cancelled: '已取消'
    };
    return statusMap[status] || status;
}
// formatError 已在 error-handler.ts 中定义，这里导入
var error_handler_1 = require("./error-handler");
Object.defineProperty(exports, "formatError", { enumerable: true, get: function () { return error_handler_1.formatError; } });
/**
 * 格式化配置对象
 */
function formatConfig(config, indent = 2) {
    try {
        return JSON.stringify(config, null, indent);
    }
    catch {
        return String(config);
    }
}
/**
 * 格式化列表
 */
function formatList(items, separator = ', ') {
    if (items.length === 0)
        return '';
    if (items.length === 1)
        return items[0];
    if (items.length === 2)
        return items.join(' 和 ');
    const last = items[items.length - 1];
    const rest = items.slice(0, -1);
    return `${rest.join(separator)} 和 ${last}`;
}
/**
 * 格式化表格数据
 */
function formatTable(data, columns) {
    if (data.length === 0)
        return '';
    const keys = columns || Object.keys(data[0]);
    const rows = data.map(row => keys.map(key => String(row[key] || '')));
    // 计算每列的最大宽度
    const widths = keys.map((key, i) => Math.max(key.length, ...rows.map(row => row[i].length)));
    // 生成表格
    const header = keys.map((key, i) => key.padEnd(widths[i])).join(' | ');
    const separator = widths.map(width => '-'.repeat(width)).join('-|-');
    const body = rows.map(row => row.map((cell, i) => cell.padEnd(widths[i])).join(' | ')).join('\n');
    return `${header}\n${separator}\n${body}`;
}
/**
 * 格式化进度条
 */
function formatProgressBar(current, total, width = 20, char = '█') {
    const percentage = total > 0 ? current / total : 0;
    const filled = Math.round(percentage * width);
    const empty = width - filled;
    return char.repeat(filled) + '░'.repeat(empty);
}
/**
 * 格式化键值对
 */
function formatKeyValue(obj, separator = ': ', indent = '  ') {
    return Object.entries(obj)
        .map(([key, value]) => `${indent}${key}${separator}${value}`)
        .join('\n');
}
/**
 * 截断文本
 */
function truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength - suffix.length) + suffix;
}
/**
 * 首字母大写
 */
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
/**
 * 驼峰转短横线
 */
function camelToKebab(text) {
    return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
/**
 * 短横线转驼峰
 */
function kebabToCamel(text) {
    return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
