// Component type definitions for LDesign Web Components

export interface LdButton {
  /**
   * Button type
   */
  type?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Whether the button is in loading state
   */
  loading?: boolean;
  /**
   * Click event handler
   */
  onLdClick?: (event: CustomEvent<MouseEvent>) => void;
}

export interface LdInput {
  /**
   * Input type
   */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
  /**
   * Input size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Input value
   */
  value?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Whether the input is readonly
   */
  readonly?: boolean;
  /**
   * Whether the input is required
   */
  required?: boolean;
  /**
   * Maximum length of input
   */
  maxlength?: number;
  /**
   * Minimum length of input
   */
  minlength?: number;
  /**
   * Input pattern for validation
   */
  pattern?: string;
  /**
   * Whether to show clear button
   */
  clearable?: boolean;
  /**
   * Whether to show password toggle (only for password type)
   */
  showPassword?: boolean;
  /**
   * Input event handler
   */
  onLdInput?: (event: CustomEvent<string>) => void;
  /**
   * Change event handler
   */
  onLdChange?: (event: CustomEvent<string>) => void;
  /**
   * Focus event handler
   */
  onLdFocus?: (event: CustomEvent<FocusEvent>) => void;
  /**
   * Blur event handler
   */
  onLdBlur?: (event: CustomEvent<FocusEvent>) => void;
  /**
   * Clear event handler
   */
  onLdClear?: (event: CustomEvent<void>) => void;
}

export interface LdTextarea {
  /**
   * Textarea size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Textarea value
   */
  value?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether the textarea is disabled
   */
  disabled?: boolean;
  /**
   * Whether the textarea is readonly
   */
  readonly?: boolean;
  /**
   * Whether the textarea is required
   */
  required?: boolean;
  /**
   * Maximum length of textarea
   */
  maxlength?: number;
  /**
   * Minimum length of textarea
   */
  minlength?: number;
  /**
   * Number of rows
   */
  rows?: number;
  /**
   * Number of columns
   */
  cols?: number;
  /**
   * Resize behavior
   */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  /**
   * Whether to show character count
   */
  showCount?: boolean;
  /**
   * Whether to auto resize height
   */
  autosize?: boolean;
  /**
   * Min rows for autosize
   */
  minRows?: number;
  /**
   * Max rows for autosize
   */
  maxRows?: number;
  /**
   * Input event handler
   */
  onLdInput?: (event: CustomEvent<string>) => void;
  /**
   * Change event handler
   */
  onLdChange?: (event: CustomEvent<string>) => void;
  /**
   * Focus event handler
   */
  onLdFocus?: (event: CustomEvent<FocusEvent>) => void;
  /**
   * Blur event handler
   */
  onLdBlur?: (event: CustomEvent<FocusEvent>) => void;
}