// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/template',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="template">
<path id="fill1" d="M21 21L21 9L3 9L3 21H10L21 21Z" [attr.fill]="color"/>
<path id="fill2" d="M21 3L3 3L3 9H10L21 9V3Z" [attr.fill]="color"/>
<path id="stroke1" d="M21 9V21H10M21 9H3M21 9V3H3V9M21 9H10M3 9V21H10M3 9H10M10 21V9" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class TemplateComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
