// Common types for LDesign Components

export type Size = 'small' | 'medium' | 'large';
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type Theme = 'light' | 'dark';

export interface ComponentProps {
  /**
   * Component size
   */
  size?: Size;
  
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  class?: string;
}

export interface ButtonProps extends ComponentProps {
  /**
   * Button variant/type
   */
  variant?: Variant | 'outline' | 'ghost' | 'link';
  
  /**
   * Button type for form submission
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * Whether button is in loading state
   */
  loading?: boolean;
  
  /**
   * Icon to display before text
   */
  icon?: string;
  
  /**
   * Icon to display after text
   */
  iconEnd?: string;
}

export interface InputProps extends ComponentProps {
  /**
   * Input type
   */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
  
  /**
   * Input value
   */
  value?: string;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Whether input is required
   */
  required?: boolean;
  
  /**
   * Whether input is readonly
   */
  readonly?: boolean;
  
  /**
   * Maximum length
   */
  maxlength?: number;
  
  /**
   * Minimum length
   */
  minlength?: number;
  
  /**
   * Input pattern for validation
   */
  pattern?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Help text
   */
  helpText?: string;
}

export interface CardProps extends ComponentProps {
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Card subtitle
   */
  subtitle?: string;
  
  /**
   * Whether card has shadow
   */
  shadow?: boolean;
  
  /**
   * Whether card is hoverable
   */
  hoverable?: boolean;
  
  /**
   * Whether card has border
   */
  bordered?: boolean;
}

export interface IconProps extends ComponentProps {
  /**
   * Icon name
   */
  name: string;
  
  /**
   * Icon color
   */
  color?: string;
  
  /**
   * Icon size (in pixels or CSS units)
   */
  iconSize?: string | number;
}

// Event types
export interface LDesignEvent<T = any> extends CustomEvent<T> {
  target: HTMLElement;
}

export interface InputEvent extends LDesignEvent<{ value: string }> {}
export interface ButtonEvent extends LDesignEvent<{ disabled: boolean }> {}

// Theme types
export interface ThemeConfig {
  primary: string;
  success: string;
  warning: string;
  error: string;
  text: string;
  background: string;
  border: string;
}

// Component registration types
export interface ComponentCollection {
  [tagName: string]: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ld-button': ButtonProps & { [key: string]: any };
      'ld-input': InputProps & { [key: string]: any };
      'ld-card': CardProps & { [key: string]: any };
      'ld-icon': IconProps & { [key: string]: any };
    }
  }
  
  interface Window {
    LDesignTheme: {
      setTheme: (theme: 'light' | 'dark' | 'auto') => void;
      getTheme: () => 'light' | 'dark';
      toggleTheme: () => void;
    };
  }
}