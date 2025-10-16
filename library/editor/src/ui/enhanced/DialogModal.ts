import { BaseComponent } from '../base/BaseComponent';
import './DialogModal.css';

export interface DialogButton {
  id: string;
  label: string;
  type?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (modal: DialogModal) => void | Promise<void>;
}

export interface DialogField {
  id: string;
  type: 'text' | 'email' | 'url' | 'textarea' | 'select' | 'checkbox' | 'number';
  label: string;
  placeholder?: string;
  value?: any;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: any }[];
  validate?: (value: any) => string | null;
  onChange?: (value: any) => void;
}

export interface DialogModalConfig {
  title: string;
  content?: string | HTMLElement;
  fields?: DialogField[];
  buttons?: DialogButton[];
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  width?: number;
  height?: number;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
}

export class DialogModal extends BaseComponent {
  private config: DialogModalConfig;
  private overlay: HTMLElement;
  private modal: HTMLElement;
  private header: HTMLElement;
  private body: HTMLElement;
  private footer: HTMLElement;
  private fieldValues: Map<string, any> = new Map();
  private fieldErrors: Map<string, string> = new Map();
  private isOpen: boolean = false;
  private buttonElements: Map<string, HTMLButtonElement> = new Map();

  constructor(config: DialogModalConfig) {
    super();
    this.config = {
      closeOnOverlayClick: true,
      closeOnEscape: true,
      showCloseButton: true,
      buttons: config.buttons || [
        { id: 'cancel', label: 'Cancel', type: 'secondary' },
        { id: 'confirm', label: 'OK', type: 'primary' }
      ],
      ...config
    };
    this.init();
  }

  protected init(): void {
    this.createElements();
    this.bindEvents();
    this.initFieldValues();
  }

  private createElements(): void {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'dialog-overlay';
    this.overlay.style.display = 'none';

    // Create modal container
    this.modal = document.createElement('div');
    this.modal.className = `dialog-modal ${this.config.className || ''}`;
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'dialog-title');

    if (this.config.width) {
      this.modal.style.width = `${this.config.width}px`;
    }
    if (this.config.height) {
      this.modal.style.height = `${this.config.height}px`;
    }

    // Create header
    this.header = document.createElement('div');
    this.header.className = 'dialog-header';

    const title = document.createElement('h2');
    title.id = 'dialog-title';
    title.className = 'dialog-title';
    title.textContent = this.config.title;
    this.header.appendChild(title);

    // Add close button if enabled
    if (this.config.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'dialog-close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Close dialog');
      closeBtn.addEventListener('click', () => this.close());
      this.header.appendChild(closeBtn);
    }

    // Create body
    this.body = document.createElement('div');
    this.body.className = 'dialog-body';

    // Add content
    if (this.config.content) {
      if (typeof this.config.content === 'string') {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'dialog-content';
        contentDiv.textContent = this.config.content;
        this.body.appendChild(contentDiv);
      } else {
        this.body.appendChild(this.config.content);
      }
    }

    // Add form fields
    if (this.config.fields && this.config.fields.length > 0) {
      const form = document.createElement('form');
      form.className = 'dialog-form';
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      this.config.fields.forEach(field => {
        const fieldGroup = this.createFieldElement(field);
        form.appendChild(fieldGroup);
      });

      this.body.appendChild(form);
    }

    // Create footer
    this.footer = document.createElement('div');
    this.footer.className = 'dialog-footer';

    // Add buttons
    if (this.config.buttons) {
      this.config.buttons.forEach(buttonConfig => {
        const button = this.createButtonElement(buttonConfig);
        this.buttonElements.set(buttonConfig.id, button);
        this.footer.appendChild(button);
      });
    }

    // Assemble modal
    this.modal.appendChild(this.header);
    this.modal.appendChild(this.body);
    this.modal.appendChild(this.footer);
    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
  }

  private createFieldElement(field: DialogField): HTMLElement {
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'dialog-field-group';
    fieldGroup.dataset.fieldId = field.id;

    // Label
    const label = document.createElement('label');
    label.className = 'dialog-field-label';
    label.htmlFor = `field-${field.id}`;
    label.textContent = field.label;
    if (field.required) {
      const required = document.createElement('span');
      required.className = 'dialog-field-required';
      required.textContent = ' *';
      label.appendChild(required);
    }
    fieldGroup.appendChild(label);

    // Input
    let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    switch (field.type) {
      case 'textarea':
        input = document.createElement('textarea');
        input.rows = 4;
        break;
      
      case 'select':
        input = document.createElement('select');
        if (field.options) {
          field.options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = String(option.value);
            optionEl.textContent = option.label;
            (input as HTMLSelectElement).appendChild(optionEl);
          });
        }
        break;
      
      case 'checkbox':
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'dialog-field-checkbox-wrapper';
        
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `field-${field.id}`;
        input.className = 'dialog-field-checkbox';
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = `field-${field.id}`;
        checkboxLabel.textContent = field.placeholder || '';
        
        checkboxWrapper.appendChild(input);
        checkboxWrapper.appendChild(checkboxLabel);
        fieldGroup.appendChild(checkboxWrapper);
        
        input.addEventListener('change', () => {
          const checked = (input as HTMLInputElement).checked;
          this.setFieldValue(field.id, checked);
          if (field.onChange) {
            field.onChange(checked);
          }
        });
        
        return fieldGroup;
      
      default:
        input = document.createElement('input');
        input.type = field.type;
    }

    input.id = `field-${field.id}`;
    input.className = 'dialog-field-input';
    
    if (field.placeholder) {
      input.placeholder = field.placeholder;
    }
    
    if (field.value !== undefined) {
      if (field.type === 'checkbox') {
        (input as HTMLInputElement).checked = !!field.value;
      } else {
        input.value = String(field.value);
      }
    }
    
    if (field.disabled) {
      input.disabled = true;
    }
    
    if (field.required) {
      input.required = true;
    }

    // Input event
    input.addEventListener('input', () => {
      const value = field.type === 'checkbox' 
        ? (input as HTMLInputElement).checked 
        : input.value;
      this.setFieldValue(field.id, value);
      this.validateField(field);
      if (field.onChange) {
        field.onChange(value);
      }
    });

    // Blur event for validation
    input.addEventListener('blur', () => {
      this.validateField(field);
    });

    fieldGroup.appendChild(input);

    // Error message container
    const errorDiv = document.createElement('div');
    errorDiv.className = 'dialog-field-error';
    errorDiv.style.display = 'none';
    fieldGroup.appendChild(errorDiv);

    return fieldGroup;
  }

  private createButtonElement(config: DialogButton): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `dialog-btn dialog-btn-${config.type || 'secondary'}`;
    button.dataset.buttonId = config.id;
    
    // Button content
    const content = document.createElement('span');
    content.textContent = config.label;
    button.appendChild(content);

    // Loading spinner
    const spinner = document.createElement('span');
    spinner.className = 'dialog-btn-spinner';
    spinner.style.display = 'none';
    spinner.innerHTML = '⟳';
    button.appendChild(spinner);

    if (config.disabled) {
      button.disabled = true;
    }

    // Click handler
    button.addEventListener('click', async () => {
      if (config.onClick) {
        await this.handleButtonClick(config, button);
      } else {
        // Default behavior
        if (config.id === 'cancel') {
          this.close();
        } else if (config.id === 'confirm') {
          await this.handleSubmit();
        }
      }
    });

    return button;
  }

  private async handleButtonClick(config: DialogButton, button: HTMLButtonElement): Promise<void> {
    if (!config.onClick) return;

    try {
      this.setButtonLoading(config.id, true);
      await config.onClick(this);
    } catch (error) {
      console.error('Button click error:', error);
      this.showError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      this.setButtonLoading(config.id, false);
    }
  }

  private async handleSubmit(): Promise<void> {
    // Validate all fields
    let hasErrors = false;
    if (this.config.fields) {
      for (const field of this.config.fields) {
        const error = this.validateField(field);
        if (error) {
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      return;
    }

    // Call onSubmit if provided
    if (this.config.onSubmit) {
      try {
        const data: Record<string, any> = {};
        this.fieldValues.forEach((value, key) => {
          data[key] = value;
        });
        
        await this.config.onSubmit(data);
        this.close();
      } catch (error) {
        console.error('Submit error:', error);
        this.showError(error instanceof Error ? error.message : 'An error occurred');
      }
    } else {
      this.close();
    }
  }

  private initFieldValues(): void {
    if (this.config.fields) {
      this.config.fields.forEach(field => {
        if (field.value !== undefined) {
          this.fieldValues.set(field.id, field.value);
        }
      });
    }
  }

  private setFieldValue(fieldId: string, value: any): void {
    this.fieldValues.set(fieldId, value);
  }

  private validateField(field: DialogField): string | null {
    const value = this.fieldValues.get(field.id);
    let error: string | null = null;

    // Required validation
    if (field.required && !value) {
      error = `${field.label} is required`;
    }

    // Custom validation
    if (!error && field.validate) {
      error = field.validate(value);
    }

    // Email validation
    if (!error && field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Invalid email address';
      }
    }

    // URL validation
    if (!error && field.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        error = 'Invalid URL';
      }
    }

    // Update UI
    const fieldGroup = this.modal.querySelector(`[data-field-id="${field.id}"]`);
    if (fieldGroup) {
      const errorDiv = fieldGroup.querySelector('.dialog-field-error') as HTMLElement;
      const input = fieldGroup.querySelector('.dialog-field-input');

      if (error) {
        this.fieldErrors.set(field.id, error);
        errorDiv.textContent = error;
        errorDiv.style.display = 'block';
        input?.classList.add('error');
      } else {
        this.fieldErrors.delete(field.id);
        errorDiv.style.display = 'none';
        input?.classList.remove('error');
      }
    }

    return error;
  }

  private bindEvents(): void {
    // Overlay click
    if (this.config.closeOnOverlayClick) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.config.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (this.isOpen && e.key === 'Escape') {
          this.close();
        }
      });
    }

    // Enter key for submit
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          this.handleSubmit();
        }
      }
    });
  }

  public open(): void {
    if (this.isOpen) return;

    this.overlay.style.display = 'flex';
    this.isOpen = true;

    // Force reflow to ensure initial state is applied
    void this.overlay.offsetHeight;

    // Animate in on next frame
    requestAnimationFrame(() => {
      this.overlay.classList.add('dialog-overlay-open');
      this.modal.classList.add('dialog-modal-open');
    });

    // Focus first input after animation starts
    setTimeout(() => {
      const firstInput = this.modal.querySelector('.dialog-field-input') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 150);

    // Trap focus
    this.trapFocus();

    if (this.config.onOpen) {
      this.config.onOpen();
    }
  }

  public close(): void {
    if (!this.isOpen) return;

    // Remove open classes to trigger close animation
    this.overlay.classList.remove('dialog-overlay-open');
    this.modal.classList.remove('dialog-modal-open');

    // Wait for animation to complete before hiding
    setTimeout(() => {
      if (!this.isOpen) { // Double check we're still closed
        this.overlay.style.display = 'none';
      }
    }, 300); // Updated to match CSS animation duration

    this.isOpen = false;

    if (this.config.onClose) {
      this.config.onClose();
    }
  }

  public setButtonLoading(buttonId: string, loading: boolean): void {
    const button = this.buttonElements.get(buttonId);
    if (button) {
      const content = button.querySelector('span:first-child') as HTMLElement;
      const spinner = button.querySelector('.dialog-btn-spinner') as HTMLElement;
      
      if (loading) {
        button.disabled = true;
        content.style.visibility = 'hidden';
        spinner.style.display = 'inline-block';
      } else {
        button.disabled = false;
        content.style.visibility = 'visible';
        spinner.style.display = 'none';
      }
    }
  }

  public setButtonDisabled(buttonId: string, disabled: boolean): void {
    const button = this.buttonElements.get(buttonId);
    if (button) {
      button.disabled = disabled;
    }
  }

  public getFieldValue(fieldId: string): any {
    return this.fieldValues.get(fieldId);
  }

  public setFieldValueById(fieldId: string, value: any): void {
    this.fieldValues.set(fieldId, value);
    
    const input = this.modal.querySelector(`#field-${fieldId}`) as HTMLInputElement;
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = !!value;
      } else {
        input.value = String(value);
      }
    }
  }

  public showError(message: string): void {
    // Create or update error alert
    let alert = this.body.querySelector('.dialog-alert-error');
    if (!alert) {
      alert = document.createElement('div');
      alert.className = 'dialog-alert dialog-alert-error';
      this.body.insertBefore(alert, this.body.firstChild);
    }
    alert.textContent = message;
  }

  public hideError(): void {
    const alert = this.body.querySelector('.dialog-alert-error');
    if (alert) {
      alert.remove();
    }
  }

  public getFormData(): Record<string, any> {
    const data: Record<string, any> = {};
    this.fieldValues.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }

  private trapFocus(): void {
    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  public destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    this.config = null as any;
    this.overlay = null as any;
    this.modal = null as any;
    this.buttonElements.clear();
    this.fieldValues.clear();
    this.fieldErrors.clear();
  }
}