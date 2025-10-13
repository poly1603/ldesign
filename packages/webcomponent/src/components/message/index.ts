/**
 * Message 组件导出
 * 提供组件和 API 两种使用方式
 */

export { LdesignMessage } from './message';
export { message, MessageManager, type MessageOptions } from './message-manager';

// 为了兼容性，也导出快捷方法
import { message } from './message-manager';

/**
 * 显示成功消息
 * @param content 消息内容
 * @param options 可选配置
 * @returns 消息ID，可用于关闭或更新
 */
export const showSuccess = message.success;

/**
 * 显示错误消息
 * @param content 消息内容
 * @param options 可选配置
 * @returns 消息ID
 */
export const showError = message.error;

/**
 * 显示警告消息
 * @param content 消息内容
 * @param options 可选配置
 * @returns 消息ID
 */
export const showWarning = message.warning;

/**
 * 显示信息消息
 * @param content 消息内容
 * @param options 可选配置
 * @returns 消息ID
 */
export const showInfo = message.info;

/**
 * 显示加载消息
 * @param content 消息内容
 * @param options 可选配置
 * @returns 消息ID
 */
export const showLoading = message.loading;

/**
 * 关闭指定消息
 * @param id 消息ID
 */
export const closeMessage = message.close;

/**
 * 关闭所有消息
 */
export const closeAllMessages = message.closeAll;

/**
 * 更新消息
 * @param id 消息ID
 * @param options 要更新的选项
 */
export const updateMessage = message.update;

// 全局配置
export const configureMessage = message.configure;

// 默认导出
export default message;