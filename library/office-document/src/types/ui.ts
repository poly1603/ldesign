/**
 * UI component type definitions
 */

/**
 * Toolbar button
 */
export interface ToolbarButton {
 id: string;
 icon: string;
 label: string;
 tooltip?: string;
 onClick: () => void;
 disabled?: boolean;
 visible?: boolean;
}

/**
 * Menu item
 */
export interface MenuItem {
 id: string;
 label: string;
 icon?: string;
 onClick?: () => void;
 submenu?: MenuItem[];
 divider?: boolean;
 disabled?: boolean;
}

/**
 * Dialog options
 */
export interface DialogOptions {
 title: string;
 content: string | HTMLElement;
 width?: string;
 height?: string;
 buttons?: DialogButton[];
 closable?: boolean;
 modal?: boolean;
}

/**
 * Dialog button
 */
export interface DialogButton {
 text: string;
 primary?: boolean;
 onClick: () => void | Promise<void>;
}

/**
 * Toast notification
 */
export interface ToastOptions {
 message: string;
 type?: 'success' | 'error' | 'warning' | 'info';
 duration?: number;
 closable?: boolean;
}
