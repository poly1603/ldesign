// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/layout',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="layout">
<path id="fill1" d="M21 21V10L3 10L3 21L21 21Z" [attr.fill]="color"/>
<path id="fill2" d="M21 3L3 3L3 10L12 10L21 10V3Z" [attr.fill]="color"/>
<path id="stroke1" d="M21 10V21H3V10M21 10H3M21 10V3H3V10M21 10H12M3 10H12M12 10V21" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class LayoutComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
