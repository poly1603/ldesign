// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/flag',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="flag">
<path id="fill1" d="M4 3H11L13 5H20L18 10.5L20 16H13L11 14H4V8.5V3Z" [attr.fill]="color"/>
<path id="stroke1" d="M4 14H11L13 16H20L18 10.5L20 5H13L11 3H4V8.5V14ZM4 14V21.5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class FlagComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
