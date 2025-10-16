import { BaseComponent } from '../../../ui/base/BaseComponent';
import { createButton, createIcon } from '../../../utils/dom';

export interface MediaProperties {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  title?: string;
  caption?: string;
}

export class MediaPropertiesDialog extends BaseComponent {
  private properties: MediaProperties = {};
  private onSave?: (properties: MediaProperties) => void;
  private onCancel?: () => void;
  private dialogElement?: HTMLElement;
  private overlayElement?: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
  }

  show(properties: MediaProperties, onSave: (props: MediaProperties) => void, onCancel?: () => void): void {
    this.properties = { ...properties };
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.render();
  }

  private render(): void {
    // Create overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'media-properties-overlay';
    this.overlayElement.onclick = () => this.cancel();

    // Create dialog
    this.dialogElement = document.createElement('div');
    this.dialogElement.className = 'media-properties-dialog';
    this.dialogElement.onclick = (e) => e.stopPropagation();

    // Dialog header
    const header = document.createElement('div');
    header.className = 'dialog-header';
    header.innerHTML = `
      <h3>Media Properties</h3>
      <button class="close-btn" title="Close">&times;</button>
    `;
    header.querySelector('.close-btn')?.addEventListener('click', () => this.cancel());

    // Dialog content
    const content = document.createElement('div');
    content.className = 'dialog-content';
    content.innerHTML = `
      <div class="form-group">
        <label for="media-src">Source URL</label>
        <input type="text" id="media-src" value="${this.properties.src || ''}" />
      </div>
      <div class="form-group">
        <label for="media-alt">Alt Text</label>
        <input type="text" id="media-alt" value="${this.properties.alt || ''}" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="media-width">Width</label>
          <input type="text" id="media-width" value="${this.properties.width || ''}" placeholder="auto" />
        </div>
        <div class="form-group">
          <label for="media-height">Height</label>
          <input type="text" id="media-height" value="${this.properties.height || ''}" placeholder="auto" />
        </div>
      </div>
      <div class="form-group">
        <label for="media-title">Title</label>
        <input type="text" id="media-title" value="${this.properties.title || ''}" />
      </div>
      <div class="form-group">
        <label for="media-caption">Caption</label>
        <textarea id="media-caption" rows="3">${this.properties.caption || ''}</textarea>
      </div>
    `;

    // Dialog footer
    const footer = document.createElement('div');
    footer.className = 'dialog-footer';
    
    const cancelBtn = createButton('Cancel', () => this.cancel());
    cancelBtn.className = 'btn btn-secondary';
    
    const saveBtn = createButton('Save', () => this.save());
    saveBtn.className = 'btn btn-primary';
    
    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);

    // Assemble dialog
    this.dialogElement.appendChild(header);
    this.dialogElement.appendChild(content);
    this.dialogElement.appendChild(footer);
    this.overlayElement.appendChild(this.dialogElement);

    // Add to DOM
    document.body.appendChild(this.overlayElement);

    // Focus first input
    const firstInput = this.dialogElement.querySelector('input');
    if (firstInput instanceof HTMLInputElement) {
      firstInput.focus();
    }
  }

  private save(): void {
    if (!this.dialogElement) return;

    const getInputValue = (id: string): string => {
      const input = this.dialogElement?.querySelector(`#${id}`) as HTMLInputElement | HTMLTextAreaElement;
      return input?.value || '';
    };

    const updatedProperties: MediaProperties = {
      src: getInputValue('media-src'),
      alt: getInputValue('media-alt'),
      width: getInputValue('media-width'),
      height: getInputValue('media-height'),
      title: getInputValue('media-title'),
      caption: getInputValue('media-caption')
    };

    this.close();
    this.onSave?.(updatedProperties);
  }

  private cancel(): void {
    this.close();
    this.onCancel?.();
  }

  private close(): void {
    this.overlayElement?.remove();
    this.overlayElement = undefined;
    this.dialogElement = undefined;
  }

  destroy(): void {
    this.close();
    super.destroy();
  }
}

export default MediaPropertiesDialog;