import { Component, Prop, h, State, Watch } from '@stencil/core';
import { classNames } from '../../utils';

// Built-in SVG icons
const BUILT_IN_ICONS = {
  loading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>`,
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22,4 12,14.01 9,11.01"></polyline>
  </svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="m12 17 .01 0"/>
  </svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m9,12 2,2 4,-4"/>
  </svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9,22 9,12 15,12 15,22"></polyline>
  </svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>`
};

@Component({
  tag: 'ld-icon',
  styleUrl: 'ld-icon.less',
  shadow: true,
})
export class LdIcon {
  /**
   * Icon name
   */
  @Prop() name: string;

  /**
   * Icon color
   */
  @Prop() color?: string;

  /**
   * Icon size (in pixels or CSS units)
   */
  @Prop() iconSize?: string | number = '1em';

  /**
   * Icon library (for future extensions)
   */
  @Prop() library?: string = 'default';

  /**
   * Custom SVG content
   */
  @Prop() svg?: string;

  /**
   * Icon source URL (for external icons)
   */
  @Prop() src?: string;

  /**
   * Alt text for accessibility
   */
  @Prop() alt?: string;

  @State() iconContent: string = '';
  @State() isLoading: boolean = false;
  @State() hasError: boolean = false;

  @Watch('name')
  @Watch('src')
  @Watch('svg')
  async handleIconChange() {
    await this.loadIcon();
  }

  async componentWillLoad() {
    await this.loadIcon();
  }

  private async loadIcon() {
    this.hasError = false;
    this.isLoading = true;

    try {
      // Priority: custom SVG > external source > built-in icons
      if (this.svg) {
        this.iconContent = this.svg;
      } else if (this.src) {
        this.iconContent = await this.loadExternalIcon(this.src);
      } else if (this.name && BUILT_IN_ICONS[this.name]) {
        this.iconContent = BUILT_IN_ICONS[this.name];
      } else {
        // Fallback to a generic icon or show error
        this.iconContent = BUILT_IN_ICONS.info || '';
        if (!BUILT_IN_ICONS[this.name]) {
          console.warn(`Icon "${this.name}" not found. Available icons:`, Object.keys(BUILT_IN_ICONS));
        }
      }
    } catch (error) {
      console.error('Failed to load icon:', error);
      this.hasError = true;
      this.iconContent = BUILT_IN_ICONS.error || '';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadExternalIcon(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch icon from ${url}`);
    }
    const content = await response.text();
    
    // Basic validation for SVG content
    if (!content.includes('<svg')) {
      throw new Error('Invalid SVG content');
    }
    
    return content;
  }

  private getSizeStyle() {
    const size = typeof this.iconSize === 'number' ? `${this.iconSize}px` : this.iconSize;
    return {
      width: size,
      height: size,
      ...(this.color && { color: this.color })
    };
  }

  render() {
    const classes = classNames(
      'ld-icon',
      {
        'ld-icon--loading': this.isLoading,
        'ld-icon--error': this.hasError,
      }
    );

    if (this.isLoading) {
      return (
        <div class={classes} style={this.getSizeStyle()}>
          <div class="ld-icon__loading" innerHTML={BUILT_IN_ICONS.loading}></div>
        </div>
      );
    }

    return (
      <div
        class={classes}
        style={this.getSizeStyle()}
        innerHTML={this.iconContent}
        role="img"
        aria-label={this.alt || this.name || 'Icon'}
      ></div>
    );
  }
}