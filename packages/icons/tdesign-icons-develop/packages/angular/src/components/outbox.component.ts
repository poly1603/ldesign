// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/outbox',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="outbox">
<path id="fill1" d="M3 21L21 21L21 15.5L15.7092 15.5C15.1159 16.9659 13.6787 18 12 18C10.3213 18 8.88415 16.9659 8.29076 15.5L3 15.5L3 21Z" [attr.fill]="color"/>
<path id="stroke1" d="M21 21V3L3 3L3 21M21 21H3M21 21L21 15.5H15.7092C15.1159 16.9659 13.6787 18 12 18C10.3213 18 8.88415 16.9659 8.29076 15.5H3L3 21" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M9 9.5L12 6.5L15 9.5M12 13V7.25" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class OutboxComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
