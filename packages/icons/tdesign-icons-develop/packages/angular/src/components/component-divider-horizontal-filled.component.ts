// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/component-divider-horizontal-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L13 22H11L11 2L13 2ZM2 5L9 5L9 19H2L2 5ZM15 5L22 5V19H15L15 5Z" [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class ComponentDividerHorizontalFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
